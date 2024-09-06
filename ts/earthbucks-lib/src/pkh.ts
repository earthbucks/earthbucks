import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
} from "./error.js";
import { Hash } from "./hash.js";
import { SysBuf, EbxBuf, FixedBuf } from "./buf.js";
import type { PubKey } from "./pub-key.js";
import { InvalidSizeError } from "./error.js";

// public key hash
export class Pkh {
  buf: FixedBuf<32>;

  constructor(pkhBuf: FixedBuf<32>) {
    this.buf = pkhBuf;
  }

  static fromPubKeyBuf(pubKeyBuf: FixedBuf<33>): Pkh {
    const pkhBuf = Hash.doubleBlake3Hash(pubKeyBuf.buf);
    return new Pkh(pkhBuf);
  }

  static fromPubKey(pubKey: PubKey): Pkh {
    return Pkh.fromPubKeyBuf(pubKey.toBuf());
  }

  static fromBuf(buf: FixedBuf<32>): Pkh {
    return new Pkh(buf);
  }

  toBuf(): FixedBuf<32> {
    return this.buf;
  }

  static fromHex(pkhHex: string): Pkh {
    const buf = FixedBuf.fromHex(32, pkhHex);
    return Pkh.fromBuf(buf);
  }

  toHex(): string {
    return this.buf.toHex();
  }

  toString(): string {
    const checkHash = SysBuf.from(Hash.blake3Hash(this.buf.buf).buf).subarray(
      0,
      4,
    );
    const checkHex = checkHash.toString("hex");
    return `ebxpkh${checkHex}${this.buf.toBase58()}`;
  }

  static fromString(pkhStr: string): Pkh {
    if (!pkhStr.startsWith("ebxpkh")) {
      throw new InvalidEncodingError();
    }
    const checkHex = pkhStr.slice(6, 14);
    const checkBuf = FixedBuf.fromHex(4, checkHex);
    const buf = FixedBuf.fromBase58(32, pkhStr.slice(14));
    const hashBuf = Hash.blake3Hash(buf.buf);
    const checkHash = hashBuf.buf.subarray(0, 4);
    if (checkHash.toString("hex") !== checkBuf.buf.toString("hex")) {
      throw new InvalidChecksumError();
    }
    return Pkh.fromBuf(buf);
  }

  static isValidStringFmt(pkhStr: string): boolean {
    try {
      Pkh.fromString(pkhStr);
    } catch (e) {
      return false;
    }
    return true;
  }
}
