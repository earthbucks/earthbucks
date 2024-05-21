import { Buffer } from "buffer";
import IsoHex from "./iso-hex";
import bs58 from "bs58";
import PrivKey from "./priv-key";
import { blake3Hash } from "./blake3";
import { Result, Ok, Err } from "ts-option-result/src/result";
import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./ebx-error";
import { None } from "ts-option-result/src/option";

export default class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x

  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): Result<PubKey, EbxError> {
    const res = privKey.toPubKeyBuffer();
    if (res.err) {
      return Err(res.val);
    }
    return Ok(new PubKey(res.unwrap()));
  }

  static fromIsoBuf(buf: Buffer): Result<PubKey, EbxError> {
    if (buf.length > PubKey.SIZE) {
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < PubKey.SIZE) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(new PubKey(buf));
  }

  toIsoBuf(): Buffer {
    return this.buf;
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PubKey, EbxError> {
    const res = IsoHex.decode(hex);
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
    return PubKey.fromIsoBuf(buf);
  }

  toIsoStr(): string {
    const checkHash = blake3Hash(this.buf);
    const checkSum = checkHash.subarray(0, 4);
    const checkHex = checkSum.toString("hex");
    return "ebxpub" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PubKey, EbxError> {
    if (!str.startsWith("ebxpub")) {
      return Err(new InvalidEncodingError(None));
    }
    const checkHex = str.slice(6, 14);
    const res = IsoHex.decode(checkHex);
    if (res.err) {
      return Err(res.val);
    }
    const checkBuf = res.unwrap();
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return Err(new InvalidChecksumError(None));
    }
    const checkHash = blake3Hash(decoded);
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
