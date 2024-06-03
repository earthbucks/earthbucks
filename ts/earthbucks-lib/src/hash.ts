import { hash, createKeyed } from "blake3";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { blake3 as blake3browser } from "@noble/hashes/blake3"; // eslint-disable-line

type EbxBufFunction = (input: SysBuf) => FixedBuf<32>;
type MacFunction = (key: SysBuf, data: SysBuf) => FixedBuf<32>;

let blake3Hash: EbxBufFunction;
let doubleBlake3Hash: EbxBufFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(32, hash(data) as SysBuf);
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(32, blake3Hash(blake3Hash(data)));
  };

  blake3Mac = function blake3Mac(key: SysBuf, data: SysBuf): FixedBuf<32> {
    return (FixedBuf<32>).fromBuf(
      32,
      createKeyed(key).update(data).digest() as SysBuf,
    );
  };
} else {
  blake3Hash = function blake3Hash(data: SysBuf): FixedBuf<32> {
    return (FixedBuf<32>).fromBuf(32, SysBuf.from(blake3browser(data)));
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(32, blake3Hash(blake3Hash(data)));
  };

  blake3Mac = function blake3Mac(key: SysBuf, data: SysBuf): FixedBuf<32> {
    return (FixedBuf<32>).fromBuf(
      32,
      SysBuf.from(blake3browser(data, { key: key })),
    );
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
