import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-option-result/src/result";

export default class HashNum {
  num: bigint;

  constructor(num: bigint) {
    this.num = num;
  }

  static fromIsoBuf(target: Buffer): Result<HashNum, string> {
    if (target.length !== 32) {
      return Err("Invalid target length");
    }
    const hex = target.toString("hex");
    const num = BigInt("0x" + hex);
    return Ok(new HashNum(num));
  }

  toIsoBuf(): Result<Buffer, string> {
    let hex = this.num.toString(16);
    // ensure length is 64 characters
    if (hex.length > 64) {
      return Err("Target number is too large");
    }
    while (hex.length < 64) {
      hex = "0" + hex;
    }
    return Ok(Buffer.from(hex, "hex"));
  }
}
