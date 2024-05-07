import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import IsoHex from "./iso-hex";
import bs58 from "bs58";
import { blake3Hash } from "./blake3";

export default class PrivKey {
  buf: Buffer;

  constructor(buf: Buffer) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privateKey;
    do {
      privateKey = crypto.getRandomValues(Buffer.alloc(32));
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new PrivKey(privateKey);
  }

  toIsoBuf(): Buffer {
    return this.buf;
  }

  toPubKeyBuffer(): Buffer {
    return Buffer.from(secp256k1.publicKeyCreate(this.buf));
  }

  toPubKeyHex(): string {
    return this.toPubKeyBuffer().toString("hex");
  }

  static fromIsoBuf(buf: Buffer): PrivKey {
    if (buf.length !== 32) {
      throw new Error("Invalid private key length");
    }
    return new PrivKey(buf);
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): PrivKey {
    return PrivKey.fromIsoBuf(IsoHex.decode(hex).unwrap());
  }

  toIsoStr(): string {
    const hashBuf = blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new Error("Invalid private key format");
    }
    let checkBuf = IsoHex.decode(str.slice(6, 14)).unwrap();
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(14)));
    } catch (e) {
      throw new Error("Invalid base58 encoding");
    }
    let hashBuf = blake3Hash(decoded);
    let checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      throw new Error("Checksum mismatch");
    }
    return PrivKey.fromIsoBuf(decoded);
  }

  static isValidStringFmt(str: string): boolean {
    let privKey: PrivKey;
    try {
      privKey = PrivKey.fromIsoStr(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
