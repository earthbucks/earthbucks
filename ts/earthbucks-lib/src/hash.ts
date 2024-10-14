import {
  blake3_hash,
  double_blake3_hash,
  blake3_mac,
} from "@earthbucks/blake3";
import { SysBuf, FixedBuf } from "./buf.js";

type HashFunction = (input: SysBuf) => FixedBuf<32>;
type MacFunction = (key: FixedBuf<32>, data: SysBuf) => FixedBuf<32>;

const blake3Hash: HashFunction = function blake3Hash(
  data: SysBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, SysBuf.from(blake3_hash(data)));
};

const doubleBlake3Hash: HashFunction = function doubleBlake3Hash(
  data: SysBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, SysBuf.from(double_blake3_hash(data)));
};

const blake3Mac: MacFunction = function blake3Mac(
  key: FixedBuf<32>,
  data: SysBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, SysBuf.from(blake3_mac(key.buf, data)));
};

export const Hash = { blake3Hash, doubleBlake3Hash, blake3Mac };
