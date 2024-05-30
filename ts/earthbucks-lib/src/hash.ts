import { hash, createKeyed } from "blake3";
import { IsoBuf } from "./iso-buf";
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type IsoBufFunction = (input: IsoBuf) => IsoBuf;
type MacFunction = (key: IsoBuf, data: IsoBuf) => IsoBuf;

let blake3Hash: IsoBufFunction;
let doubleBlake3Hash: IsoBufFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: IsoBuf): IsoBuf {
    return hash(data) as IsoBuf;
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: IsoBuf): IsoBuf {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: IsoBuf, data: IsoBuf): IsoBuf {
    return createKeyed(key).update(data).digest() as IsoBuf;
  };
} else {
  blake3Hash = function blake3Hash(data: IsoBuf): IsoBuf {
    return IsoBuf.from(blake3browser(data));
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: IsoBuf): IsoBuf {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: IsoBuf, data: IsoBuf): IsoBuf {
    return IsoBuf.from(blake3browser(data, { key: key }));
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
