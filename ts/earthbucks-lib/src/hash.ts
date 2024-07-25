import { hash, createKeyed } from "blake3";
import { SysBuf, FixedBuf } from "./buf.js";
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type HashFunction = (input: SysBuf) => FixedBuf<32>;
type MacFunction = (key: FixedBuf<32>, data: SysBuf) => FixedBuf<32>;

let blake3Hash: HashFunction;
let doubleBlake3Hash: HashFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment

  blake3Hash = function blake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(32, hash(data) as SysBuf);
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(32, blake3Hash(blake3Hash(data).buf).buf);
  };

  blake3Mac = function blake3Mac(
    key: FixedBuf<32>,
    data: SysBuf,
  ): FixedBuf<32> {
    return FixedBuf.fromBuf(
      32,
      createKeyed(key.buf).update(data).digest() as SysBuf,
    );
  };
} else {
  //running in a browser environment

  blake3Hash = function blake3Hash(data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(
      32,
      SysBuf.from(blake3browser(data), data.byteOffset, data.length),
    );
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: SysBuf): FixedBuf<32> {
    return blake3Hash(blake3Hash(data).buf);
  };

  blake3Mac = function blake3Mac(
    key: FixedBuf<32>,
    data: SysBuf,
  ): FixedBuf<32> {
    const res = blake3browser(data, { key: key.buf });
    return FixedBuf.fromBuf(32, SysBuf.from(res));
  };
}

export const Hash = { blake3Hash, doubleBlake3Hash, blake3Mac };
