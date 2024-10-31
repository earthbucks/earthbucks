import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import type { PrivKey } from "./priv-key.js";
import { Hash } from "./hash.js";
import { publicKeyAdd } from "@webbuf/secp256k1";
import bs58 from "bs58";

export class PubKey {
  static readonly SIZE = 33; // y-is-odd byte plus 32-byte x
  buf: FixedBuf<33>;

  constructor(buf: FixedBuf<33>) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): PubKey {
    const buf = privKey.toPubKeyBuf();
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
    return `ebxpub${checkHex}${bs58.encode(this.buf.buf)}`;
  }

  static fromString(str: string): PubKey {
    if (!str.startsWith("ebxpub")) {
      throw new Error("invalid encoding");
    }
    const checkHex = str.slice(6, 14);
    const checkBuf = FixedBuf.fromHex(4, checkHex);
    const decoded33 = FixedBuf.fromBuf(
      33,
      WebBuf.from(bs58.decode(str.slice(14))),
    );
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
    const buf = publicKeyAdd(this.buf, pubKey.buf);
    return PubKey.fromBuf(buf);
  }
}
