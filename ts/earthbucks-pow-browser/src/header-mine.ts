import type { SysBuf } from "@earthbucks/lib";
import type { FixedBuf } from "@earthbucks/lib";
import { GenericError } from "@earthbucks/lib";
import { U256 } from "@earthbucks/lib";
import type { Header } from "@earthbucks/lib";
import { BufReader } from "@earthbucks/lib";
import type { PowGpu } from "./pow-gpu.js";

function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new GenericError("Operation timed out")), ms),
  );
}

type AsyncHashFunction = (input: SysBuf) => Promise<FixedBuf<32>>;

export async function HeaderMine(
  header: Header,
  lch10Ids: FixedBuf<32>[],
  shareTargetNum: U256,
  PowGpuClass: typeof PowGpu,
  blake3Async: AsyncHashFunction,
): Promise<{ header: Header; count: number; duration: number }> {
  if (
    header.workSerAlgoStr() !== "blake3_3" ||
    header.workParAlgoStr() !== "algo1627"
  ) {
    throw new GenericError("Unsupported PoW algorithms");
  }

  let count = 0;
  let duration = 0;

  let workingHeader: Header = header.toWorkingHeader();
  const workingBlockId = workingHeader.id();
  const gpupow = new PowGpuClass(workingBlockId, lch10Ids);

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

    const id = workingHeader.id();
    const idNum = new BufReader(id.buf).readU256BE();
    if (idNum.bn < shareTargetNum.bn) {
      console.log(id.buf.toString("hex"));
      break;
    }
    workingHeader.nonce = workingHeader.nonce.add(new U256(1));
  }
  const end = Date.now();
  duration = end - start;
  return { header: workingHeader, count, duration };
}
