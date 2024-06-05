import { Header } from "./header.js";
import { SysBuf, FixedBuf } from "./buf.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";
import { BufReader } from "./buf-reader.js";

export class HeaderMine {
  header: Header;

  constructor(header: Header) {
    this.header = header;
  }

  randomizeNonce(): void {
    const buf = (FixedBuf<32>).fromBuf(
      32,
      crypto.getRandomValues(SysBuf.alloc(32)),
    );
    this.header.nonce = new BufReader(buf).readU256BE();
  }

  getIdHashNum(): U256 {
    const headerId = this.header.id();
    const br = new BufReader(headerId);
    const hashNum = br.readU256BE();
    return hashNum;
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
