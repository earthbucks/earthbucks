import { doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

// public key hash
export default class Pkh {
  buf: Buffer;

  constructor(pkhBuf: Buffer) {
    this.buf = pkhBuf;
  }

  static fromPubKeyBuffer(publicKey: Buffer): Pkh {
    let pkhBuf = doubleBlake3Hash(publicKey);
    return new Pkh(pkhBuf);
  }
}
