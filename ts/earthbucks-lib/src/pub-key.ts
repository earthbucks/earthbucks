import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
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
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < PubKey.SIZE) {
      return Err(new NotEnoughDataError(None));
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
    return "ebxpub" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PubKey, EbxError> {
    if (!str.startsWith("ebxpub")) {
      return Err(new InvalidEncodingError(None));
    }
    const checkHex = str.slice(6, 14);
    const res = FixedIsoBuf.fromStrictHex(4, checkHex);
    if (res.err) {
      return Err(res.val);
    }
    const checkBuf = res.unwrap();
    let decoded: SysBuf;
    try {
      decoded = SysBuf.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return Err(new InvalidChecksumError(None));
    }
    const decoded33Res = (FixedIsoBuf<33>).fromBuf(33, decoded);
    if (decoded33Res.err) {
      return Err(new InvalidEncodingError(None));
    }
    const decoded33 = decoded33Res.unwrap();
    const checkHash = Hash.blake3Hash(decoded);
    const checkSum = checkHash.subarray(0, 4);
    if (!checkBuf.equals(checkSum)) {
      return Err(new InvalidEncodingError(None));
    }
    return PubKey.fromIsoBuf(decoded33);
  }

  static isValidStringFmt(str: string): boolean {
    const res = PubKey.fromIsoStr(str);
    return res.ok;
  }
}
