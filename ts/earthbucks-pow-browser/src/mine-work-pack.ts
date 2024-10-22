import { WebBuf, WorkPack } from "@earthbucks/lib";
import type { FixedBuf } from "@earthbucks/lib";
import { U256 } from "@earthbucks/lib";
import type { Header } from "@earthbucks/lib";
import { BufReader } from "@earthbucks/lib";
import type { PowGpu } from "./pow-gpu.js";

function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), ms),
  );
}

type AsyncHashFunction = (input: WebBuf) => Promise<FixedBuf<32>>;

export async function MineWorkPack(
  workPack: WorkPack,
  shareTargetNum: U256,
  PowGpuClass: typeof PowGpu,
  blake3Async: AsyncHashFunction,
): Promise<{ workPack: WorkPack; count: number; duration: number }> {
  const header = workPack.header;
  const lch10IdsArr = workPack.lch10Ids.ids;
  if (
    header.workSerAlgoStr() !== "blake3_3" ||
    header.workParAlgoStr() !== "algo1627"
  ) {
    throw new Error("Unsupported PoW algorithms");
  }

  let count = 0;
  let duration = 0;

  let workingHeader: Header = header.toWorkingHeader();
  const workingBlockId = workingHeader.id();
  const gpupow = new PowGpuClass(workingBlockId, lch10IdsArr);

  const start = Date.now();
  while (true) {
    count++;
    workingHeader = workingHeader.toWorkingHeader();
    const workingBlockId = workingHeader.id();
    gpupow.updateWorkingBlockId(workingBlockId);

    // TODO: execute algorithms in parallel

    // algo1627
    const reducedBufs = await (Promise.race([
      gpupow.algo1627(),
      timeout(10000),
    ]) as ReturnType<typeof gpupow.algo1627>);
    const matrixHashBuf = await (Promise.race([
      gpupow.reducedBufsHashAsync(reducedBufs, blake3Async),
      timeout(10000),
    ]) as ReturnType<typeof gpupow.reducedBufsHashAsync>);
    workingHeader.workParHash = matrixHashBuf;

    // blake3_3
    workingHeader.workSerHash = await blake3Async(
      (await blake3Async((await blake3Async(workingBlockId.buf)).buf)).buf,
    );

    const idNum = workingHeader.idNum();
    if (idNum.bn < shareTargetNum.bn) {
      const id = workingHeader.id();
      console.log(id.buf.toString("hex"));
      break;
    }
    workingHeader.nonce = workingHeader.nonce.add(new U256(1));
  }
  const end = Date.now();
  duration = end - start;
  const resWorkPack = new WorkPack(workingHeader, workPack.lch10Ids);
  return { workPack: resWorkPack, count, duration };
}
