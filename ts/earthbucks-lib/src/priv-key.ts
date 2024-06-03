import secp256k1 from "secp256k1";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
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
  buf: FixedIsoBuf<32>;

  constructor(buf: FixedIsoBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = (FixedIsoBuf<32>).fromBuf(
        32,
        crypto.getRandomValues(SysBuf.alloc(32)),
      );
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toIsoBuf(): FixedIsoBuf<32> {
    return this.buf;
  }

  toPubKeyIsoBuf(): FixedIsoBuf<33> {
    return FixedIsoBuf.fromBuf(
      33,
      SysBuf.from(secp256k1.publicKeyCreate(this.buf)),
    );
  }

  toPubKeyHex(): string {
    return this.toPubKeyIsoBuf().toStrictHex();
  }

  static fromIsoBuf(buf: FixedIsoBuf<32>): PrivKey {
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

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): PrivKey {
    const buf = FixedIsoBuf.fromStrictHex(32, hex);
    const buf32: FixedIsoBuf<32> = FixedIsoBuf.fromBuf(32, buf);
    return PrivKey.fromIsoBuf(buf32);
  }

  toIsoStr(): string {
    const hashBuf = Hash.blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new InvalidEncodingError();
    }
    const hexStr = str.slice(6, 14);
    const checkBuf = FixedIsoBuf.fromStrictHex(4, hexStr);
    const decoded32 = (FixedIsoBuf<32>).fromBase58(32, str.slice(14));
    const hashBuf = Hash.blake3Hash(decoded32);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      throw new InvalidChecksumError();
    }
    return PrivKey.fromIsoBuf(decoded32);
  }

  static isValidIsoStr(str: string): boolean {
    try {
      PrivKey.fromIsoStr(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
