import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import StrictHex, { isValid } from "./strict-hex";
import bs58 from "bs58";
import PrivKey from "./priv-key";

export default class PubKey {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromPrivKey(privKey: PrivKey): PubKey {
    return new PubKey(privKey.toPubKeyBuffer());
  }

  static fromBuffer(buf: Buffer): PubKey {
    if (buf.length !== 33) {
      throw new Error("Invalid public key length");
    }
    return new PubKey(buf);
  }

  toHex(): string {
    return this.buf.toString("hex");
  }

  static fromHex(hex: string): PubKey {
    return PubKey.fromBuffer(StrictHex.decode(hex));
  }

  toStringFmt(): string {
    return "ebxpub" + bs58.encode(this.buf);
  }

  static fromStringFmt(str: string): PubKey {
    if (!str.startsWith("ebxpub")) {
      throw new Error("Invalid public key format");
    }
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(6)));
    } catch (e) {
      throw new Error("Invalid base58 encoding");
    }
    return PubKey.fromBuffer(decoded);
  }

  static isValidStringFmt(str: string): boolean {
    let pubKey: PubKey;
    try {
      pubKey = PubKey.fromStringFmt(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
