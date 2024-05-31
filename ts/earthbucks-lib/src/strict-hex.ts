import { IsoBuf } from "./iso-buf";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { EbxError, InvalidHexError } from "./ebx-error.js";
import { Option, Some, None } from "earthbucks-opt-res";

export class StrictHex {
  public buf: IsoBuf;

  constructor(buf: IsoBuf) {
    this.buf = buf;
  }

  static isValid(hex: string): boolean {
    return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
  }

  static encode(buffer: IsoBuf): string {
    return buffer.toString("hex");
  }

  static decode(hex: string): Result<IsoBuf, EbxError> {
    if (!StrictHex.isValid(hex)) {
      return Err(new InvalidHexError(None));
    }
    const buffer = IsoBuf.from(hex, "hex");
    return Ok(buffer);
  }

  static fromStrictHex(hex: string): Result<StrictHex, EbxError> {
    return StrictHex.decode(hex).map((buf) => new StrictHex(buf));
  }

  toStrictHex(): string {
    return StrictHex.encode(this.buf);
  }

  static fromIsoBuf(buf: IsoBuf): StrictHex {
    return new StrictHex(buf);
  }

  toIsoBuf(): IsoBuf {
    return this.buf;
  }
}
