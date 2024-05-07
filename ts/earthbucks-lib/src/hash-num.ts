import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-results";

export default class HashNum {
  num: bigint;

  constructor(num: bigint) {
    this.num = num;
  }

  static fromIsoBuf(target: Buffer): Result<HashNum, string> {
    try {
      if (target.length !== 32) {
        return Err("Invalid target length");
      }
      let hex = target.toString("hex");
      let num = BigInt("0x" + hex);
      return Ok(new HashNum(num));
    } catch (err) {
      return Err(err?.toString() || "Unknown error parsing hash num");
    }
  }

  toIsoBuf(): Result<Buffer, string> {
    try {
      let hex = this.num.toString(16);
      // ensure length is 64 characters
      if (hex.length > 64) {
        return Err("Target number is too large");
      }
      while (hex.length < 64) {
        hex = "0" + hex;
      }
      return Ok(Buffer.from(hex, "hex"));
    } catch (err) {
      return Err(err?.toString() || "Unknown error serializing hash num");
    }
  }
}
