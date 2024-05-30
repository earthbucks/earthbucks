import { Header } from "./header.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { HashNum } from "./hash-num.js";
import { EbxBuffer } from "./ebx-buffer";

export class HeaderMine {
  header: Header;

  constructor(header: Header) {
    this.header = header;
  }

  randomizeNonce(): void {
    this.header.nonce = crypto.getRandomValues(EbxBuffer.alloc(32));
  }

  getIdHashNum(): HashNum {
    const headerId = this.header.id();
    const hashNum = HashNum.fromIsoBuf(EbxBuffer.from(headerId)).unwrap();
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

  getLowestNonceForNTimes(n: number): EbxBuffer {
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
