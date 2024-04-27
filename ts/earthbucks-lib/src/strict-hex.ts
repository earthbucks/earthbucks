import { Buffer } from "buffer";

export function isValid(hex: string): boolean {
  return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
}

export function encode(buffer: Buffer): string {
  return buffer.toString("hex");
}

export function decode(hex: string): Buffer {
  if (!isValid(hex)) {
    throw new Error("Invalid hex string");
  }
  const buffer = Buffer.from(hex, "hex");
  return buffer;
}

let StrictHex = { encode, decode, isValid };
export default StrictHex;