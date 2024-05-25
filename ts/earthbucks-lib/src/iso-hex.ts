import { Buffer } from "buffer";
import { Result, Ok, Err } from "./opt-res/result";
import { EbxError, InvalidHexError } from "./ebx-error";
import { Option, Some, None } from "./opt-res/option";

export function isValid(hex: string): boolean {
  return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
}

export function encode(buffer: Buffer): string {
  return buffer.toString("hex");
}

export function decode(hex: string): Result<Buffer, EbxError> {
  if (!isValid(hex)) {
    return Err(new InvalidHexError(None));
  }
  const buffer = Buffer.from(hex, "hex");
  return Ok(buffer);
}

const IsoHex = { encode, decode, isValid };
export default IsoHex;
