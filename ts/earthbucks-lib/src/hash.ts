import { hash, createKeyed } from "blake3";
import { EbxBuffer } from "./ebx-buffer";
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type EbxBufferFunction = (input: EbxBuffer) => EbxBuffer;
type MacFunction = (key: EbxBuffer, data: EbxBuffer) => EbxBuffer;

let blake3Hash: EbxBufferFunction;
let doubleBlake3Hash: EbxBufferFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: EbxBuffer): EbxBuffer {
    return hash(data) as EbxBuffer;
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: EbxBuffer): EbxBuffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: EbxBuffer, data: EbxBuffer): EbxBuffer {
    return createKeyed(key).update(data).digest() as EbxBuffer;
  };
} else {
  blake3Hash = function blake3Hash(data: EbxBuffer): EbxBuffer {
    return EbxBuffer.from(blake3browser(data));
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: EbxBuffer): EbxBuffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: EbxBuffer, data: EbxBuffer): EbxBuffer {
    return EbxBuffer.from(blake3browser(data, { key: key }));
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
