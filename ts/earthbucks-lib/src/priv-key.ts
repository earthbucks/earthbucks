import secp256k1 from "secp256k1";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import * as Hash from "./hash.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
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
      privateKey = (FixedIsoBuf<32>)
        .fromBuf(32, crypto.getRandomValues(SysBuf.alloc(32)))
        .unwrap();
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toIsoBuf(): FixedIsoBuf<32> {
    return this.buf;
  }

  toPubKeyIsoBuf(): Result<FixedIsoBuf<33>, EbxError> {
    try {
      return Ok(
        (FixedIsoBuf<33>)
          .fromBuf(33, SysBuf.from(secp256k1.publicKeyCreate(this.buf)))
          .unwrap(),
      );
    } catch (err) {
      return Err(new InvalidKeyError());
    }
  }

  toPubKeyHex(): Result<string, EbxError> {
    const res = this.toPubKeyIsoBuf();
    if (res.err) {
      return res;
    }
    return Ok(res.unwrap().toString("hex"));
  }

  static fromIsoBuf(buf: FixedIsoBuf<32>): Result<PrivKey, EbxError> {
    if (buf.length > 32) {
      return Err(new TooMuchDataError());
    }
    if (buf.length < 32) {
      return Err(new NotEnoughDataError());
    }
    if (!secp256k1.privateKeyVerify(buf)) {
      return Err(new InvalidEncodingError());
    }
    return Ok(new PrivKey(buf));
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PrivKey, EbxError> {
    const bufRes = FixedIsoBuf.fromStrictHex(32, hex);
    if (bufRes.err) {
      return bufRes;
    }
    const buf = bufRes.unwrap();
    const buf32: FixedIsoBuf<32> = FixedIsoBuf.fromBuf(32, buf).unwrap();
    return PrivKey.fromIsoBuf(buf32);
  }

  toIsoStr(): string {
    const hashBuf = Hash.blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(str: string): Result<PrivKey, EbxError> {
    if (!str.startsWith("ebxprv")) {
      return Err(new InvalidEncodingError());
    }
    const hexStr = str.slice(6, 14);
    const checkBufRes = FixedIsoBuf.fromStrictHex(4, hexStr);
    if (checkBufRes.err) {
      return checkBufRes;
    }
    const checkBuf = checkBufRes.unwrap();
    const decoded32Res = (FixedIsoBuf<32>).fromBase58(32, str.slice(14));
    if (decoded32Res.err) {
      return decoded32Res;
    }
    const decoded32 = decoded32Res.unwrap();
    const hashBuf = Hash.blake3Hash(decoded32);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      return Err(new InvalidEncodingError());
    }
    return PrivKey.fromIsoBuf(decoded32);
  }

  static isValidIsoStr(str: string): boolean {
    return PrivKey.fromIsoStr(str).ok;
  }
}
