import secp256k1 from "secp256k1";
import { IsoBuf, FixedIsoBuf } from "./iso-buf";
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
  buf: FixedIsoBuf<32>;

  constructor(buf: FixedIsoBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = (FixedIsoBuf<32>)
        .fromIsoBuf(32, crypto.getRandomValues(IsoBuf.alloc(32)))
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
          .fromIsoBuf(33, IsoBuf.from(secp256k1.publicKeyCreate(this.buf)))
          .unwrap(),
      );
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

  static fromIsoBuf(buf: FixedIsoBuf<32>): Result<PrivKey, EbxError> {
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
    const buf32: FixedIsoBuf<32> = (FixedIsoBuf<32>)
      .fromIsoBuf(32, buf)
      .unwrap();
    return PrivKey.fromIsoBuf(buf32);
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
    const decoded32Res = (FixedIsoBuf<32>).fromIsoBuf(32, decoded);
    if (decoded32Res.err) {
      return decoded32Res;
    }
    const decoded32 = decoded32Res.unwrap();
    const hashBuf = Hash.blake3Hash(decoded);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      return Err(new InvalidEncodingError(None));
    }
    return PrivKey.fromIsoBuf(decoded32);
  }

  static isValidIsoStr(str: string): boolean {
    return PrivKey.fromIsoStr(str).ok;
  }
}
