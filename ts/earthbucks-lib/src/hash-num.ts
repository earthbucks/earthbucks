import { FixedIsoBuf, IsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";

export class HashNum {
  num: bigint;

  constructor(num: bigint) {
    this.num = num;
  }

  static fromIsoBuf(target: FixedIsoBuf<32>): Result<HashNum, string> {
    if (target.length !== 32) {
      return Err("Invalid target length");
    }
    const hex = target.toString("hex");
    const num = BigInt("0x" + hex);
    return Ok(new HashNum(num));
  }

  toIsoBuf(): Result<FixedIsoBuf<32>, string> {
    let hex = this.num.toString(16);
    if (hex.length > 64) {
      return Err("Target number is too large");
    }
    while (hex.length < 64) {
      hex = "0" + hex;
    }
    return Ok(FixedIsoBuf.fromHex(32, hex).unwrap());
  }
}
