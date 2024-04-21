import { Blake3Hasher } from "@napi-rs/blake-hash";
import { Buffer } from "buffer";

export function blake3Hash(data: Uint8Array): Uint8Array {
  const hasher = new Blake3Hasher();
  hasher.update(Buffer.from(data));
  const hex = hasher.digest("hex");
  return new Uint8Array(Buffer.from(hex, "hex"));
}

export function doubleBlake3Hash(data: Uint8Array): Uint8Array {
  return blake3Hash(blake3Hash(data));
}
