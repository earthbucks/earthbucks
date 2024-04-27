import { doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";
import bs58 from "bs58";

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

  static fromBuffer(buf: Buffer): Pkh {
    if (buf.length !== 32) {
      throw new Error("Invalid public key hash length");
    }
    return new Pkh(buf);
  }

  toStringFmt(): string {
    return "ebxpkh" + bs58.encode(this.buf);
  }

  static fromStringFmt(pkhStr: string): Pkh {
    if (!pkhStr.startsWith("ebxpkh")) {
      throw new Error("Invalid public key hash format");
    }
    let buf = Buffer.from(bs58.decode(pkhStr.slice(6)));
    return Pkh.fromBuffer(buf);
  }

  static isValidStringFmt(pkhStr: string): boolean {
    let pkh: Pkh;
    try {
      pkh = Pkh.fromStringFmt(pkhStr);
    } catch (e) {
      return false;
    }
    return true;
  }
}
