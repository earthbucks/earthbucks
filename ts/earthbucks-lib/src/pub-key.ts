import { IsoBuf } from "./iso-buf";
import { StrictHex } from "./strict-hex.js";
import bs58 from "bs58";
import { PrivKey } from "./priv-key.js";
import * as Hash from "./hash.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error.js";
import { Option, None, Some } from "earthbucks-opt-res/src/lib.js";

export class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x

  buf: IsoBuf;

  constructor(buf: IsoBuf) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): Result<PubKey, EbxError> {
    const res = privKey.toPubKeyIsoBuf();
    if (res.err) {
      return Err(res.val);
    }
    return Ok(new PubKey(res.unwrap()));
  }

  static fromIsoBuf(buf: IsoBuf): Result<PubKey, EbxError> {
    if (buf.length > PubKey.SIZE) {
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < PubKey.SIZE) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(new PubKey(buf));
  }

  toIsoBuf(): IsoBuf {
    return this.buf;
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PubKey, EbxError> {
    const res = StrictHex.decode(hex);
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
    return PubKey.fromIsoBuf(buf);
  }

  toIsoStr(): string {
    const checkHash = Hash.blake3Hash(this.buf);
    const checkSum = checkHash.subarray(0, 4);
    const checkHex = checkSum.toString("hex");
    return "ebxpub" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PubKey, EbxError> {
    if (!str.startsWith("ebxpub")) {
      return Err(new InvalidEncodingError(None));
    }
    const checkHex = str.slice(6, 14);
    const res = StrictHex.decode(checkHex);
    if (res.err) {
      return Err(res.val);
    }
    const checkBuf = res.unwrap();
    let decoded: IsoBuf;
    try {
      decoded = IsoBuf.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return Err(new InvalidChecksumError(None));
    }
    const checkHash = Hash.blake3Hash(decoded);
    const checkSum = checkHash.subarray(0, 4);
    if (!checkBuf.equals(checkSum)) {
      return Err(new InvalidEncodingError(None));
    }
    return PubKey.fromIsoBuf(decoded);
  }

  static isValidStringFmt(str: string): boolean {
    const res = PubKey.fromIsoStr(str);
    return res.ok;
  }
}
