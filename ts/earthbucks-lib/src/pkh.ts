import { doubleBlake3Hash, blake3Hash } from "./blake3";
import { Buffer } from "buffer";
import bs58 from "bs58";
import IsoHex from "./iso-hex";
import PubKey from "./pub-key";

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

  static fromPubKey(pubKey: PubKey): Pkh {
    return Pkh.fromPubKeyBuffer(pubKey.toIsoBuf());
  }

  static fromIsoBuf(buf: Buffer): Pkh {
    if (buf.length !== 32) {
      throw new Error("Invalid public key hash length");
    }
    return new Pkh(buf);
  }

  toIsoStr(): string {
    let checkHash = blake3Hash(this.buf).subarray(0, 4);
    let checkHex = checkHash.toString("hex");
    return "ebxpkh" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(pkhStr: string): Pkh {
    if (!pkhStr.startsWith("ebxpkh")) {
      throw new Error("Invalid pkh format");
    }
    let checkHex = pkhStr.slice(6, 14);
    let checkBuf = IsoHex.decode(checkHex);
    let buf = Buffer.from(bs58.decode(pkhStr.slice(14)));
    let hashBuf = blake3Hash(buf);
    let checkHash = hashBuf.subarray(0, 4);
    if (!checkHash.equals(checkBuf)) {
      throw new Error("Invalid pkh checksum");
    }
    return Pkh.fromIsoBuf(buf);
  }

  static isValidStringFmt(pkhStr: string): boolean {
    let pkh: Pkh;
    try {
      pkh = Pkh.fromIsoStr(pkhStr);
    } catch (e) {
      return false;
    }
    return true;
  }
}
