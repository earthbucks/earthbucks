import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { PrivKey } from "./priv-key.js";
import * as Hash from "./hash.js";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";

export class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x
  buf: FixedBuf<33>;

  constructor(buf: FixedBuf<33>) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): PubKey {
    const buf = privKey.toPubKeyEbxBuf();
    const isoBuf33 = (FixedBuf<33>).fromBuf(33, buf);
    return new PubKey(isoBuf33);
  }

  static fromBuf(buf: FixedBuf<33>): PubKey {
    if (buf.length > PubKey.SIZE) {
      throw new TooMuchDataError();
    }
    if (buf.length < PubKey.SIZE) {
      throw new NotEnoughDataError();
    }
    return new PubKey(buf);
  }

  toBuf(): FixedBuf<33> {
    return this.buf;
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): PubKey {
    const buf = FixedBuf.fromStrictHex(PubKey.SIZE, hex);
    return PubKey.fromBuf(buf);
  }

  toIsoStr(): string {
    const checkHash = Hash.blake3Hash(this.buf);
    const checkSum = checkHash.subarray(0, 4);
    const checkHex = checkSum.toString("hex");
    return "ebxpub" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(str: string): PubKey {
    if (!str.startsWith("ebxpub")) {
      throw new InvalidEncodingError();
    }
    const checkHex = str.slice(6, 14);
    const checkBuf = FixedBuf.fromStrictHex(4, checkHex);
    const decoded33 = FixedBuf.fromBase58(33, str.slice(14));
    const checkHash = Hash.blake3Hash(decoded33);
    const checkSum = checkHash.subarray(0, 4);
    if (!checkBuf.equals(checkSum)) {
      throw new InvalidChecksumError();
    }
    return PubKey.fromBuf(decoded33);
  }

  static isValidStringFmt(str: string): boolean {
    try {
      PubKey.fromIsoStr(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
