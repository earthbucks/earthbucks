import { SysBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { EbxError, InvalidHexError } from "./ebx-error.js";
import { Option, Some, None } from "earthbucks-opt-res/src/lib.js";

export class StrictHex {
  public buf: SysBuf;

  constructor(buf: SysBuf) {
    this.buf = buf;
  }

  static isValid(hex: string): boolean {
    return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
  }

  static encode(buffer: SysBuf): string {
    return buffer.toString("hex");
  }

  static decode(hex: string): Result<SysBuf, EbxError> {
    if (!StrictHex.isValid(hex)) {
      return Err(new InvalidHexError(None));
    }
    const buffer = SysBuf.from(hex, "hex");
    return Ok(buffer);
  }

  static fromStrictHex(hex: string): Result<StrictHex, EbxError> {
    return StrictHex.decode(hex).map((buf) => new StrictHex(buf));
  }

  toStrictHex(): string {
    return StrictHex.encode(this.buf);
  }

  static fromIsoBuf(buf: SysBuf): StrictHex {
    return new StrictHex(buf);
  }

  toIsoBuf(): SysBuf {
    return this.buf;
  }
}
