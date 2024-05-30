import { EbxBuf } from "./ebx-buf";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { EbxError, InvalidHexError } from "./ebx-error.js";
import { Option, Some, None } from "earthbucks-opt-res";

export class IsoHex {
  static isValid(hex: string): boolean {
    return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
  }

  static encode(buffer: EbxBuf): string {
    return buffer.toString("hex");
  }

  static decode(hex: string): Result<EbxBuf, EbxError> {
    if (!IsoHex.isValid(hex)) {
      return Err(new InvalidHexError(None));
    }
    const buffer = EbxBuf.from(hex, "hex");
    return Ok(buffer);
  }
}
