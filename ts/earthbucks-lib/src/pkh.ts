import { doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

// public key hash
export default class Pkh {
  pkh: Buffer;

  constructor(publicKey: Buffer) {
    this.pkh = doubleBlake3Hash(publicKey);
  }
}
