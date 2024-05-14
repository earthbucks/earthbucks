import { Buffer } from "buffer";
import IsoHex from "./iso-hex";
import bs58 from "bs58";
import PrivKey from "./priv-key";
import { blake3Hash } from "./blake3";
import { Result, Ok, Err } from "./ts-results/result";

export default class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x

  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): PubKey {
    return new PubKey(privKey.toPubKeyBuffer());
  }

  static fromIsoBuf(buf: Buffer): Result<PubKey, string> {
    if (buf.length !== PubKey.SIZE) {
      return new Err("Invalid public key length");
    }
    return new Ok(new PubKey(buf));
  }

  toIsoBuf(): Buffer {
    return this.buf;
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PubKey, string> {
    let res = IsoHex.decode(hex);
    if (res.err) {
      return new Err(res.val);
    }
    const buf = res.unwrap();
    return PubKey.fromIsoBuf(buf);
  }

  toIsoStr(): string {
    let checkHash = blake3Hash(this.buf);
    let checkSum = checkHash.subarray(0, 4);
    let checkHex = checkSum.toString("hex");
    return "ebxpub" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PubKey, string> {
    if (!str.startsWith("ebxpub")) {
      return new Err("Invalid public key format");
    }
    let checkHex = str.slice(6, 14);
    let res = IsoHex.decode(checkHex);
    if (res.err) {
      return new Err(res.val);
    }
    let checkBuf = res.unwrap();
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return new Err("Invalid base58 encoding");
    }
    let checkHash = blake3Hash(decoded);
    let checkSum = checkHash.subarray(0, 4);
    if (!checkBuf.equals(checkSum)) {
      return new Err("Invalid checksum");
    }
    return PubKey.fromIsoBuf(decoded);
  }

  static isValidStringFmt(str: string): boolean {
    let res = PubKey.fromIsoStr(str);
    return res.ok;
  }
}
