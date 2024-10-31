import {
  privateKeyAdd,
  publicKeyCreate,
  privateKeyVerify,
} from "@webbuf/secp256k1";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { Hash } from "./hash.js";
import bs58 from "bs58";

export class PrivKey {
  buf: FixedBuf<32>;

  constructor(buf: FixedBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privKeyBuf: FixedBuf<32>;
    do {
      privKeyBuf = FixedBuf.fromRandom(32);
    } while (!privateKeyVerify(privKeyBuf));
    return new PrivKey(privKeyBuf);
  }

  toBuf(): FixedBuf<32> {
    return this.buf;
  }

  toPubKeyBuf(): FixedBuf<33> {
    return publicKeyCreate(this.buf);
  }

  toPubKeyHex(): string {
    return this.toPubKeyBuf().toHex();
  }

  static fromBuf(buf: FixedBuf<32>): PrivKey {
    if (!privateKeyVerify(buf)) {
      throw new Error("invalid encoding");
    }
    return new PrivKey(buf);
  }

  toHex(): string {
    return this.buf.buf.toString("hex");
  }

  static fromHex(hex: string): PrivKey {
    const buf = FixedBuf.fromHex(32, hex);
    const buf32: FixedBuf<32> = FixedBuf.fromBuf(32, buf.buf);
    return PrivKey.fromBuf(buf32);
  }

  toString(): string {
    const hashBuf = Hash.blake3Hash(this.buf.buf);
    const checkBuf = WebBuf.from(hashBuf.buf).subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return `ebxprv${checkHex}${bs58.encode(this.buf.buf)}`;
  }

  static fromString(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new Error("invalid encoding");
    }
    const hexStr = str.slice(6, 14);
    const checkBuf = FixedBuf.fromHex(4, hexStr);
    const decoded32 = FixedBuf.fromBuf(
      32,
      WebBuf.from(bs58.decode(str.slice(14))),
    );
    const hashBuf = Hash.blake3Hash(decoded32.buf);
    const checkHash = hashBuf.buf.subarray(0, 4);
    if (checkBuf.buf.toString("hex") !== checkHash.toString("hex")) {
      throw new Error("invalid checksum");
    }
    return PrivKey.fromBuf(decoded32);
  }

  static isValidStrictStr(str: string): boolean {
    try {
      PrivKey.fromString(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  add(privKey: PrivKey): PrivKey {
    const buf = privateKeyAdd(this.buf, privKey.buf);
    return PrivKey.fromBuf(buf);
  }
}
