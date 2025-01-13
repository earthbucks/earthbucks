import {
  create_pow2,
  Pow2 as Pow2Raw,
  sha256 as sha256Raw,
} from "./rs-earthbucks_pow2-inline-base64/earthbucks_pow2.js";
import { Header, WebBuf, FixedBuf } from "@earthbucks/lib";

type HEADER_SIZE = 217;

export class Pow2 {
  private pow2: Pow2Raw;

  constructor(header: FixedBuf<HEADER_SIZE>, resetNonce: boolean) {
    this.pow2 = create_pow2(header.buf, resetNonce);
  }
}

export async function sha256(data: WebBuf): Promise<FixedBuf<32>> {
  const arr = sha256Raw(data);
  return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
}
