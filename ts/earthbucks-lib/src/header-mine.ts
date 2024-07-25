import type { Header } from "./header.js";
import { SysBuf, FixedBuf } from "./buf.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";
import { BufReader } from "./buf-reader.js";

export class HeaderMine {
  header: Header;

  constructor(header: Header) {
    this.header = header;
  }

  randomizeNonce() {
    const buf = FixedBuf.fromRandom(32);
    this.header.nonce = U256.fromBEBuf(buf.buf);
  }

  getIdHashNum(): U256 {
    return U256.fromBEBuf(this.header.id().buf);
  }

  getLowestIdForNTimes(n: number): U256 {
    let lowest = this.getIdHashNum();
    for (let i = 0; i < n; i++) {
      this.randomizeNonce();
      const hashNum = this.getIdHashNum();
      if (hashNum.bn < lowest.bn) {
        lowest = hashNum;
      }
    }
    return lowest;
  }

  getLowestNonceForNTimes(n: number): U256 {
    let lowest = this.getIdHashNum();
    let nonce = this.header.nonce;
    for (let i = 0; i < n; i++) {
      this.randomizeNonce();
      const hashNum = this.getIdHashNum();
      if (hashNum.bn < lowest.bn) {
        lowest = hashNum;
        nonce = this.header.nonce;
      }
    }
    return nonce;
  }
}
