import { hash, createKeyed } from "blake3";
import { IsoBuf, FixedIsoBuf } from "./iso-buf.js";
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type IsoBufFunction = (input: IsoBuf) => FixedIsoBuf<32>;
type MacFunction = (key: IsoBuf, data: IsoBuf) => FixedIsoBuf<32>;

let blake3Hash: IsoBufFunction;
let doubleBlake3Hash: IsoBufFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>).fromIsoBuf(32, hash(data) as IsoBuf).unwrap();
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>)
      .fromIsoBuf(32, blake3Hash(blake3Hash(data)))
      .unwrap();
  };

  blake3Mac = function blake3Mac(key: IsoBuf, data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>)
      .fromIsoBuf(32, createKeyed(key).update(data).digest() as IsoBuf)
      .unwrap();
  };
} else {
  blake3Hash = function blake3Hash(data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>)
      .fromIsoBuf(32, IsoBuf.from(blake3browser(data)))
      .unwrap();
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>)
      .fromIsoBuf(32, blake3Hash(blake3Hash(data)))
      .unwrap();
  };

  blake3Mac = function blake3Mac(key: IsoBuf, data: IsoBuf): FixedIsoBuf<32> {
    return (FixedIsoBuf<32>)
      .fromIsoBuf(32, IsoBuf.from(blake3browser(data, { key: key })))
      .unwrap();
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
