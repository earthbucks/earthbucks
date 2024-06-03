import { FixedIsoBuf, SysBuf } from "./iso-buf.js";
import { InvalidSizeError, InvalidEncodingError } from "./ebx-error.js";

export class HashNum {
  num: bigint;

  constructor(num: bigint) {
    this.num = num;
  }

  static fromIsoBuf(target: FixedIsoBuf<32>): HashNum {
    if (target.length !== 32) {
      throw new InvalidSizeError();
    }
    const hex = target.toString("hex");
    const num = BigInt("0x" + hex);
    return new HashNum(num);
  }

  toIsoBuf(): FixedIsoBuf<32> {
    let hex = this.num.toString(16);
    if (hex.length > 64) {
      throw new InvalidEncodingError();
    }
    while (hex.length < 64) {
      hex = "0" + hex;
    }
    return FixedIsoBuf.fromStrictHex(32, hex);
  }
}
