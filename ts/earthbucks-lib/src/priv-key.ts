import secp256k1 from "secp256k1";
import { SysBuf, FixedBuf } from "./buf.js";
import * as Hash from "./hash.js";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  InvalidKeyError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./error.js";

export class PrivKey {
  buf: FixedBuf<32>;

  constructor(buf: FixedBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privKeyBuf;
    do {
      privKeyBuf = FixedBuf.fromRandom(32);
    } while (!secp256k1.privateKeyVerify(privKeyBuf.buf));
    return new PrivKey(privKeyBuf);
  }

  toBuf(): FixedBuf<32> {
    return this.buf;
  }

  toPubKeyEbxBuf(): FixedBuf<33> {
    return FixedBuf.fromBuf(
      33,
      SysBuf.from(secp256k1.publicKeyCreate(this.buf.buf)),
    );
  }

  toPubKeyHex(): string {
    return this.toPubKeyEbxBuf().toStrictHex();
  }

  static fromBuf(buf: FixedBuf<32>): PrivKey {
    if (!secp256k1.privateKeyVerify(buf.buf)) {
      throw new InvalidEncodingError();
    }
    return new PrivKey(buf);
  }

  toStrictHex(): string {
    return this.buf.buf.toString("hex");
  }

  static fromStrictHex(hex: string): PrivKey {
    const buf = FixedBuf.fromStrictHex(32, hex);
    const buf32: FixedBuf<32> = FixedBuf.fromBuf(32, buf.buf);
    return PrivKey.fromBuf(buf32);
  }

  toStrictStr(): string {
    const hashBuf = Hash.blake3Hash(this.buf.buf);
    const checkBuf = SysBuf.from(hashBuf.buf).subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + this.buf.toBase58();
  }

  static fromStrictStr(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new InvalidEncodingError();
    }
    const hexStr = str.slice(6, 14);
    const checkBuf = FixedBuf.fromStrictHex(4, hexStr);
    const decoded32 = FixedBuf.fromBase58(32, str.slice(14));
    const hashBuf = Hash.blake3Hash(decoded32.buf);
    const checkHash = hashBuf.buf.subarray(0, 4);
    if (checkBuf.buf.toString("hex") !== checkHash.toString("hex")) {
      throw new InvalidChecksumError();
    }
    return PrivKey.fromBuf(decoded32);
  }

  static isValidStrictStr(str: string): boolean {
    try {
      PrivKey.fromStrictStr(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
