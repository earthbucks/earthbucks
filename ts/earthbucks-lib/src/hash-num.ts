import { Buffer } from "buffer";

export default class HashNum {
  num: bigint;

  constructor(num: bigint) {
    this.num = num;
  }

  static fromBuffer(target: Buffer): HashNum {
    if (target.length !== 32) {
      throw new Error("Invalid target length");
    }
    let hex = target.toString("hex");
    let num = BigInt("0x" + hex);
    return new HashNum(num);
  }

  toBuffer(): Buffer {
    let hex = this.num.toString(16);
    // ensure length is 64 characters
    if (hex.length > 64) {
      throw new Error("Target number is too large");
    }
    while (hex.length < 64) {
      hex = "0" + hex;
    }
    return Buffer.from(hex, "hex");
  }
}
