import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
} from "./error.js";
import * as Hash from "./hash.js";
import { SysBuf, EbxBuf, FixedBuf } from "./buf.js";
import { PubKey } from "./pub-key.js";
import { InvalidSizeError } from "./error.js";

// public key hash
export class Pkh {
  buf: FixedBuf<32>;

  constructor(pkhBuf: FixedBuf<32>) {
    this.buf = pkhBuf;
  }

  static fromPubKeyBuf(pubKeyBuf: FixedBuf<33>): Pkh {
    const pkhBuf = Hash.doubleBlake3Hash(pubKeyBuf);
    return new Pkh(pkhBuf);
  }

  static fromPubKey(pubKey: PubKey): Pkh {
    return Pkh.fromPubKeyBuf(pubKey.toBuf());
  }

  static fromBuf(buf: FixedBuf<32>): Pkh {
    return new Pkh(buf);
  }

  toStrictStr(): string {
    const checkHash = SysBuf.from(Hash.blake3Hash(this.buf)).subarray(0, 4);
    const checkHex = checkHash.toString("hex");
    return "ebxpkh" + checkHex + this.buf.toBase58();
  }

  static fromStrictStr(pkhStr: string): Pkh {
    if (!pkhStr.startsWith("ebxpkh")) {
      throw new InvalidEncodingError();
    }
    const checkHex = pkhStr.slice(6, 14);
    const checkBuf = FixedBuf.fromStrictHex(4, checkHex);
    const buf = FixedBuf.fromBase58(32, pkhStr.slice(14));
    const hashBuf = Hash.blake3Hash(buf);
    const checkHash = SysBuf.from(hashBuf).subarray(0, 4);
    if (checkHash.toString("hex") !== checkBuf.toString("hex")) {
      throw new InvalidChecksumError();
    }
    return Pkh.fromBuf(buf);
  }

  static isValidStringFmt(pkhStr: string): boolean {
    try {
      Pkh.fromStrictStr(pkhStr);
    } catch (e) {
      return false;
    }
    return true;
  }
}
