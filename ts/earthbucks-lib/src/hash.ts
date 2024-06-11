import { hash, createKeyed } from "blake3";
import { SysBuf, FixedBuf } from "./buf.js";
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
    return FixedBuf.fromBuf(32, blake3Hash(blake3Hash(data).buf).buf);
  };

  blake3Mac = function blake3Mac(key: SysBuf, data: SysBuf): FixedBuf<32> {
    return FixedBuf.fromBuf(
      32,
      createKeyed(key).update(data).digest() as SysBuf,
    );
  };
} else {
  blake3Hash = function blake3Hash(data: SysBuf): FixedBuf<32> {
    data = SysBuf.from(data.buffer, data.byteOffset, data.length);
    return FixedBuf.fromBuf(
      32,
      SysBuf.from(blake3browser(data), data.byteOffset, data.length),
    );
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: SysBuf): FixedBuf<32> {
    data = SysBuf.from(data.buffer, data.byteOffset, data.length);
    return blake3Hash(blake3Hash(data).buf);
  };

  blake3Mac = function blake3Mac(key: SysBuf, data: SysBuf): FixedBuf<32> {
    data = SysBuf.from(data.buffer, data.byteOffset, data.length);
    key = SysBuf.from(key.buffer, key.byteOffset, key.length);
    return FixedBuf.fromBuf(
      32,
      SysBuf.from(
        blake3browser(data, { key: key }),
        data.byteOffset,
        data.length,
      ),
    );
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
