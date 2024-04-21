import Header from "./header";
import BufferReader from "./buffer-reader";
import HashNum from "./hash-num";

export default class HeaderMine {
  header: Header;

  constructor(header: Header) {
    this.header = header;
  }

  randomizeNonce(): void {
    this.header.nonce = crypto.getRandomValues(new Uint8Array(32));
  }

  getIdHashNum(): HashNum {
    const headerId = this.header.id();
    const hashNum = HashNum.fromBuffer(Buffer.from(headerId));
    return hashNum;
  }

  getLowestIdForNTimes(n: number): HashNum {
    let lowest = this.getIdHashNum();
    for (let i = 0; i < n; i++) {
      this.randomizeNonce();
      const hashNum = this.getIdHashNum();
      if (hashNum.num < lowest.num) {
        lowest = hashNum;
      }
    }
    return lowest;
  }

  getLowestNonceForNTimes(n: number): Uint8Array {
    let lowest = this.getIdHashNum();
    let nonce = this.header.nonce;
    for (let i = 0; i < n; i++) {
      this.randomizeNonce();
      const hashNum = this.getIdHashNum();
      if (hashNum.num < lowest.num) {
        lowest = hashNum;
        nonce = this.header.nonce;
      }
    }
    return nonce;
  }
}