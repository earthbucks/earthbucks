import { hash } from "blake3";
import { Buffer } from "buffer";

export function blake3Hash(data: Buffer): Buffer {
  return hash(data) as Buffer;
}

export function doubleBlake3Hash(data: Buffer): Buffer {
  return blake3Hash(blake3Hash(data));
}
