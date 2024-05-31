import secp256k1 from "secp256k1";
import { IsoBuf } from "./iso-buf";
import { StrictHex } from "./strict-hex.js";
import bs58 from "bs58";
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
import { Option, None, Some } from "earthbucks-opt-res/src/lib.js";

export class PrivKey {
  buf: IsoBuf;

  constructor(buf: IsoBuf) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = crypto.getRandomValues(IsoBuf.alloc(32));
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toIsoBuf(): IsoBuf {
    return this.buf;
  }

  toPubKeyIsoBuf(): Result<IsoBuf, EbxError> {
    try {
      return Ok(IsoBuf.from(secp256k1.publicKeyCreate(this.buf)));
    } catch (err) {
      return Err(new InvalidKeyError(None));
    }
  }

  toPubKeyHex(): Result<string, EbxError> {
    const res = this.toPubKeyIsoBuf();
    if (res.err) {
      return res;
    }
    return Ok(res.unwrap().toString("hex"));
  }

  static fromIsoBuf(buf: IsoBuf): Result<PrivKey, EbxError> {
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
    const bufRes = StrictHex.decode(hex);
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
    const checkBufRes = StrictHex.decode(hexStr);
    if (checkBufRes.err) {
      return checkBufRes;
    }
    const checkBuf = checkBufRes.unwrap();
    let decoded: IsoBuf;
    try {
      decoded = IsoBuf.from(bs58.decode(str.slice(14)));
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
