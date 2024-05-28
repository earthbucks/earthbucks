import { hash, createKeyed } from "blake3";
import { Buffer } from "buffer";
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type BufferFunction = (input: Buffer) => Buffer;
type MacFunction = (key: Buffer, data: Buffer) => Buffer;

let blake3Hash: BufferFunction;
let doubleBlake3Hash: BufferFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: Buffer): Buffer {
    return hash(data) as Buffer;
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: Buffer, data: Buffer): Buffer {
    return createKeyed(key).update(data).digest() as Buffer;
  };
} else {
  blake3Hash = function blake3Hash(data: Buffer): Buffer {
    return Buffer.from(blake3browser(data));
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: Buffer, data: Buffer): Buffer {
    return Buffer.from(blake3browser(data, { key: key }));
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac}