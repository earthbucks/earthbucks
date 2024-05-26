import { Buffer } from "buffer";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { EbxError, InvalidHexError } from "./ebx-error.js";
import { Option, Some, None } from "earthbucks-opt-res";

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
