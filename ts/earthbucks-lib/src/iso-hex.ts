import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";

export function isValid(hex: string): boolean {
  return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
}

export function encode(buffer: Buffer): string {
  return buffer.toString("hex");
}

export function decode(hex: string): Result<Buffer, string> {
  if (!isValid(hex)) {
    return Err("Invalid hex string");
  }
  const buffer = Buffer.from(hex, "hex");
  return Ok(buffer);
}

const IsoHex = { encode, decode, isValid };
export default IsoHex;
