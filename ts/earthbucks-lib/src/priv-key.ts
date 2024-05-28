import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import { IsoHex } from "./iso-hex.js";
import bs58 from "bs58";
import * as Hash from "./hash.js";
import { Result, Ok, Err } from "earthbucks-opt-res";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  InvalidKeyError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";
import { Option, None, Some } from "earthbucks-opt-res";

export class PrivKey {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = crypto.getRandomValues(Buffer.alloc(32));
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toIsoBuf(): Buffer {
    return this.buf;
  }

  toPubKeyBuffer(): Result<Buffer, EbxError> {
    try {
      return Ok(Buffer.from(secp256k1.publicKeyCreate(this.buf)));
    } catch (err) {
      return Err(new InvalidKeyError(None));
    }
  }

  toPubKeyHex(): Result<string, EbxError> {
    const res = this.toPubKeyBuffer();
    if (res.err) {
      return res;
    }
    return Ok(res.unwrap().toString("hex"));
  }

  static fromIsoBuf(buf: Buffer): Result<PrivKey, EbxError> {
    if (buf.length > 32) {
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < 32) {
      return Err(new NotEnoughDataError(None));
    }
    if (!secp256k1.privateKeyVerify(buf)) {
      return Err(new InvalidEncodingError(None));
    }
    return Ok(new PrivKey(buf));
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PrivKey, EbxError> {
    const bufRes = IsoHex.decode(hex);
    if (bufRes.err) {
      return bufRes;
    }
    const buf = bufRes.unwrap();
    return PrivKey.fromIsoBuf(buf);
  }

  toIsoStr(): string {
    const hashBuf = Hash.blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PrivKey, EbxError> {
    if (!str.startsWith("ebxprv")) {
      return Err(new InvalidEncodingError(None));
    }
    const hexStr = str.slice(6, 14);
    const checkBufRes = IsoHex.decode(hexStr);
    if (checkBufRes.err) {
      return checkBufRes;
    }
    const checkBuf = checkBufRes.unwrap();
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return Err(new InvalidChecksumError(None));
    }
    const hashBuf = Hash.blake3Hash(decoded);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      return Err(new InvalidEncodingError(None));
    }
    return PrivKey.fromIsoBuf(decoded);
  }

  static isValidIsoStr(str: string): boolean {
    return PrivKey.fromIsoStr(str).ok;
  }
}
