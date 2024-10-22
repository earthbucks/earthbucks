import { WebBuf, FixedBuf } from "./buf.js";
import type { PrivKey } from "./priv-key.js";
import { Hash } from "./hash.js";
import { public_key_add } from "@earthbucks/secp256k1";

export class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x
  buf: FixedBuf<33>;

  constructor(buf: FixedBuf<33>) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): PubKey {
    const buf = privKey.toPubKeyEbxBuf();
    const isoBuf33 = (FixedBuf<33>).fromBuf(33, buf.buf);
    return new PubKey(isoBuf33);
  }

  static fromBuf(buf: FixedBuf<33>): PubKey {
    return new PubKey(buf);
  }

  toBuf(): FixedBuf<33> {
    return this.buf;
  }

  toHex(): string {
    return this.buf.buf.toString("hex");
  }

  static fromHex(hex: string): PubKey {
    const buf = FixedBuf.fromHex(PubKey.SIZE, hex);
    return PubKey.fromBuf(buf);
  }

  toString(): string {
    const checkHash = Hash.blake3Hash(this.buf.buf);
    const checkSum = WebBuf.from(checkHash.buf).subarray(0, 4);
    const checkHex = checkSum.toString("hex");
    return `ebxpub${checkHex}${this.buf.toBase58()}`;
  }

  static fromString(str: string): PubKey {
    if (!str.startsWith("ebxpub")) {
      throw new Error("invalid encoding");
    }
    const checkHex = str.slice(6, 14);
    const checkBuf = FixedBuf.fromHex(4, checkHex);
    const decoded33 = FixedBuf.fromBase58(33, str.slice(14));
    const checkHash = Hash.blake3Hash(decoded33.buf);
    const checkSum = checkHash.buf.subarray(0, 4);
    if (checkBuf.buf.toString("hex") !== checkSum.toString("hex")) {
      throw new Error("invalid checksum");
    }
    return PubKey.fromBuf(decoded33);
  }

  static isValidStrictStr(str: string): boolean {
    try {
      PubKey.fromString(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  add(pubKey: PubKey): PubKey {
    const buf = public_key_add(this.buf.buf, pubKey.buf.buf);
    const fixedBuf = FixedBuf.fromBuf(33, WebBuf.from(buf));
    return PubKey.fromBuf(fixedBuf);
  }
}
