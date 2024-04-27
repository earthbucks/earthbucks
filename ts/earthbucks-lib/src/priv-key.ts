import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import crypto from "crypto";
import StrictHex from "./strict-hex";
import bs58 from "bs58";

export default class PrivKey {
  buf: Buffer

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toPubKeyBuffer(): Buffer {
    return Buffer.from(secp256k1.publicKeyCreate(this.buf));
  }

  static fromBuffer(buf: Buffer): PrivKey {
    if (buf.length !== 32) {
      throw new Error("Invalid private key length");
    }
    return new PrivKey(buf);
  }

  toHex(): string {
    return this.buf.toString("hex");
  }

  static fromHex(hex: string): PrivKey {
    return PrivKey.fromBuffer(StrictHex.decode(hex));
  }

  toStringFmt(): string {
    return 'prv' + bs58.encode(this.buf);
  }

  static fromStringFmt(str: string): PrivKey {
    if (!str.startsWith('prv')) {
      throw new Error("Invalid private key format");
    }
    let decoded: Buffer
    try {
      decoded = Buffer.from(bs58.decode(str.slice(3)));
    } catch (e) {
      throw new Error("Invalid base58 encoding");
    }
    return PrivKey.fromBuffer(decoded);
  }

  static isValid(str: string): boolean {
    let privKey: PrivKey
    try {
      privKey = PrivKey.fromStringFmt(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}