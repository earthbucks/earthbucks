import secp256k1 from "secp256k1";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import * as Hash from "./hash.js";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  InvalidKeyError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";

export class PrivKey {
  buf: FixedBuf<32>;

  constructor(buf: FixedBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = (FixedBuf<32>).fromBuf(
        32,
        crypto.getRandomValues(SysBuf.alloc(32)),
      );
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toBuf(): FixedBuf<32> {
    return this.buf;
  }

  toPubKeyEbxBuf(): FixedBuf<33> {
    return FixedBuf.fromBuf(
      33,
      SysBuf.from(secp256k1.publicKeyCreate(this.buf)),
    );
  }

  toPubKeyHex(): string {
    return this.toPubKeyEbxBuf().toStrictHex();
  }

  static fromBuf(buf: FixedBuf<32>): PrivKey {
    if (buf.length > 32) {
      throw new TooMuchDataError();
    }
    if (buf.length < 32) {
      throw new NotEnoughDataError();
    }
    if (!secp256k1.privateKeyVerify(buf)) {
      throw new InvalidEncodingError();
    }
    return new PrivKey(buf);
  }

  toStrictHex(): string {
    return this.buf.toString("hex");
  }

  static fromStrictHex(hex: string): PrivKey {
    const buf = FixedBuf.fromStrictHex(32, hex);
    const buf32: FixedBuf<32> = FixedBuf.fromBuf(32, buf);
    return PrivKey.fromBuf(buf32);
  }

  toStrictStr(): string {
    const hashBuf = Hash.blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + this.buf.toBase58();
  }

  static fromStrictStr(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new InvalidEncodingError();
    }
    const hexStr = str.slice(6, 14);
    const checkBuf = FixedBuf.fromStrictHex(4, hexStr);
    const decoded32 = (FixedBuf<32>).fromBase58(32, str.slice(14));
    const hashBuf = Hash.blake3Hash(decoded32);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      throw new InvalidChecksumError();
    }
    return PrivKey.fromBuf(decoded32);
  }

  static isValidIsoStr(str: string): boolean {
    try {
      PrivKey.fromStrictStr(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
