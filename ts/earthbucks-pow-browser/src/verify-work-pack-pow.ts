import type { SysBuf, WorkPack } from "@earthbucks/lib";
import { FixedBuf } from "@earthbucks/lib";
import { GenericError } from "@earthbucks/lib";
import { HeaderVerificationError } from "@earthbucks/lib";
import type { Header } from "@earthbucks/lib";
import type { PowGpu } from "./pow-gpu.js";

function timeout(ms: number) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new GenericError("Operation timed out")), ms),
  );
}

type AsyncHashFunction = (input: SysBuf) => Promise<FixedBuf<32>>;

const nullHash = FixedBuf.alloc(32).buf;

/**
 * This method ONLY verifies whether workSerHash and workParHash are correct,
 * i.e. that when the header is worked on the, the values in the header are the
 * correct results. This method does NOT validate that the ID of the header is
 * less than the target. It is assumed that verification happens elsewhere. The
 * verify/validate methods on Header and BlockVerify are responsibile for that.
 */
export async function verifyWorkPackPow(
  workPack: WorkPack,
  PowGpuClass: typeof PowGpu,
  blake3Async: AsyncHashFunction,
): Promise<void> {
  const header = workPack.header;
  const lch10IdsArr = workPack.lch10Ids.ids;
  if (header.workSerAlgoStr() !== "blake3_3") {
    throw new HeaderVerificationError("unsupported serial PoW algorithm");
  }
  if (header.workParAlgoStr() !== "algo1627") {
    throw new HeaderVerificationError("unsupported parallel PoW algorithm");
  }

  if (header.workSerHash.buf.equals(nullHash)) {
    throw new HeaderVerificationError("serial hash is null");
  }
  if (header.workParHash.buf.equals(nullHash)) {
    throw new HeaderVerificationError("parallel hash is null");
  }

  const workingHeader: Header = header.toWorkingHeader();
  const workingBlockId = workingHeader.id();
  const gpupow = new PowGpuClass(workingBlockId, lch10IdsArr);

  // TODO: execute algorithms in parallel

  // blake3_3
  const workSerHash = await blake3Async(
    (await blake3Async((await blake3Async(workingBlockId.buf)).buf)).buf,
  );

  if (!header.workSerHash.buf.equals(workSerHash.buf)) {
    throw new HeaderVerificationError("serial hash does not match");
  }

  // algo1627
  const reducedBufs = await (Promise.race([
    gpupow.algo1627(),
    timeout(10000),
  ]) as ReturnType<typeof gpupow.algo1627>);
  const matrixHashBuf = await (Promise.race([
    gpupow.reducedBufsHashAsync(reducedBufs, blake3Async),
    timeout(10000),
  ]) as ReturnType<typeof gpupow.reducedBufsHashAsync>);
  const workParHash = matrixHashBuf;

  if (!header.workParHash.buf.equals(workParHash.buf)) {
    throw new HeaderVerificationError("parallel hash does not match");
  }
}
