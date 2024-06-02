import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
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

export class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x
  buf: FixedIsoBuf<33>;

  constructor(buf: FixedIsoBuf<33>) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): Result<PubKey, EbxError> {
    const res = privKey.toPubKeyIsoBuf();
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
    const isoBuf33 = (FixedIsoBuf<33>).fromBuf(33, buf).unwrap();
    return Ok(new PubKey(isoBuf33));
  }

  static fromIsoBuf(buf: FixedIsoBuf<33>): Result<PubKey, EbxError> {
    if (buf.length > PubKey.SIZE) {
      return Err(new TooMuchDataError());
    }
    if (buf.length < PubKey.SIZE) {
      return Err(new NotEnoughDataError());
    }
    return Ok(new PubKey(buf));
  }

  toIsoBuf(): FixedIsoBuf<33> {
    return this.buf;
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PubKey, EbxError> {
    const res = FixedIsoBuf.fromStrictHex(PubKey.SIZE, hex);
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
    const isoBuf33 = (FixedIsoBuf<33>).fromBuf(33, buf).unwrap();
    return PubKey.fromIsoBuf(isoBuf33);
  }

  toIsoStr(): string {
    const checkHash = Hash.blake3Hash(this.buf);
    const checkSum = checkHash.subarray(0, 4);
    const checkHex = checkSum.toString("hex");
    return "ebxpub" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(str: string): Result<PubKey, EbxError> {
    if (!str.startsWith("ebxpub")) {
      return Err(new InvalidEncodingError());
    }
    const checkHex = str.slice(6, 14);
    const res = FixedIsoBuf.fromStrictHex(4, checkHex);
    if (res.err) {
      return Err(res.val);
    }
    const checkBuf = res.unwrap();
    const decoded33Res = FixedIsoBuf.fromBase58(33, str.slice(14));
    if (decoded33Res.err) {
      return Err(new InvalidEncodingError());
    }
    const decoded33 = decoded33Res.unwrap();
    const checkHash = Hash.blake3Hash(decoded33);
    const checkSum = checkHash.subarray(0, 4);
    if (!checkBuf.equals(checkSum)) {
      return Err(new InvalidEncodingError());
    }
    return PubKey.fromIsoBuf(decoded33);
  }

  static isValidStringFmt(str: string): boolean {
    const res = PubKey.fromIsoStr(str);
    return res.ok;
  }
}
