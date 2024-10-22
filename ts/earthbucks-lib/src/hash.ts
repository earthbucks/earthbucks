import {
  blake3_hash,
  double_blake3_hash,
  blake3_mac,
} from "@earthbucks/blake3";
import { WebBuf, FixedBuf } from "./buf.js";

type HashFunction = (input: WebBuf) => FixedBuf<32>;
type MacFunction = (key: FixedBuf<32>, data: WebBuf) => FixedBuf<32>;

const blake3Hash: HashFunction = function blake3Hash(
  data: WebBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, WebBuf.from(blake3_hash(data)));
};

const doubleBlake3Hash: HashFunction = function doubleBlake3Hash(
  data: WebBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, WebBuf.from(double_blake3_hash(data)));
};

const blake3Mac: MacFunction = function blake3Mac(
  key: FixedBuf<32>,
  data: WebBuf,
): FixedBuf<32> {
  return FixedBuf.fromBuf(32, WebBuf.from(blake3_mac(key.buf, data)));
};

export const Hash = { blake3Hash, doubleBlake3Hash, blake3Mac };
