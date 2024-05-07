import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import IsoHex from "./iso-hex";
import bs58 from "bs58";
import { blake3Hash } from "./blake3";
import { Result, Ok, Err } from "ts-results";

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

  static fromIsoBuf(buf: Buffer): Result<PrivKey, string> {
    if (buf.length !== 32) {
      return Err("Invalid private key length");
    }
    if (!secp256k1.privateKeyVerify(buf)) {
      return Err("Invalid private key");
    }
    return Ok(new PrivKey(buf));
  }

  toIsoHex(): string {
    return this.buf.toString("hex");
  }

  static fromIsoHex(hex: string): Result<PrivKey, string> {
    return PrivKey.fromIsoBuf(IsoHex.decode(hex).unwrap());
  }

  toIsoStr(): string {
    const hashBuf = blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PrivKey, string> {
    try {
      if (!str.startsWith("ebxprv")) {
        return Err("Invalid private key format");
      }
      let checkBuf = IsoHex.decode(str.slice(6, 14)).unwrap();
      let decoded: Buffer;
      try {
        decoded = Buffer.from(bs58.decode(str.slice(14)));
      } catch (e) {
        return Err("Invalid base58 encoding");
      }
      let hashBuf = blake3Hash(decoded);
      let checkBuf2 = hashBuf.subarray(0, 4);
      if (!checkBuf.equals(checkBuf2)) {
        return Err("Checksum mismatch");
      }
      return PrivKey.fromIsoBuf(decoded);
    } catch (err) {
      return Err(err?.toString() || "Unknown error parsing private key");
    }
  }

  static isValidStringFmt(str: string): boolean {
    return PrivKey.fromIsoStr(str).ok;
  }
}
