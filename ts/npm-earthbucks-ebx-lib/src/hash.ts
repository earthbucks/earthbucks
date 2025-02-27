import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { blake3Hash, doubleBlake3Hash, blake3Mac } from "@webbuf/blake3";

function blake3Kdf(
  key: FixedBuf<32>,
  context: FixedBuf<32>,
  nIter = 1e6,
): FixedBuf<32> {
  let buf = key;
  for (let i = 0; i < nIter; i++) {
    buf = blake3Mac(buf, context.buf);
  }
  return buf;
}

export const Hash = { blake3Hash, doubleBlake3Hash, blake3Mac, blake3Kdf };
