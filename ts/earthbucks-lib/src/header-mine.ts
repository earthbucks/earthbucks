import { Header } from "./header.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";
import { IsoBufReader } from "./iso-buf-reader.js";

export class HeaderMine {
  header: Header;

  constructor(header: Header) {
    this.header = header;
  }

  randomizeNonce(): void {
    this.header.nonce = (FixedIsoBuf<32>).fromBuf(
      32,
      crypto.getRandomValues(SysBuf.alloc(32)),
    );
  }

  getIdHashNum(): U256 {
    const headerId = this.header.id();
    const br = new IsoBufReader(headerId);
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

  getLowestNonceForNTimes(n: number): SysBuf {
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
