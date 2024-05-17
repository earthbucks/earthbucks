import secp256k1 from "secp256k1";
import { Buffer } from "buffer";
import IsoHex from "./iso-hex";
import bs58 from "bs58";
import { blake3Hash } from "./blake3";
import { Result, Ok, Err } from "./ts-results/result";

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
    const bufRes = IsoHex.decode(hex);
    if (bufRes.err) {
      return bufRes;
    }
    const buf = bufRes.unwrap();
    return PrivKey.fromIsoBuf(buf);
  }

  toIsoStr(): string {
    const hashBuf = blake3Hash(this.buf);
    const checkBuf = hashBuf.subarray(0, 4);
    const checkHex = checkBuf.toString("hex");
    return "ebxprv" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(str: string): Result<PrivKey, string> {
    if (!str.startsWith("ebxprv")) {
      return Err("Invalid private key format");
    }
    const hexStr = str.slice(6, 14);
    const checkBufRes = IsoHex.decode(hexStr);
    if (checkBufRes.err) {
      return checkBufRes;
    }
    const checkBuf = checkBufRes.unwrap();
    let decoded: Buffer;
    try {
      decoded = Buffer.from(bs58.decode(str.slice(14)));
    } catch (e) {
      return Err("Invalid base58 encoding");
    }
    const hashBuf = blake3Hash(decoded);
    const checkBuf2 = hashBuf.subarray(0, 4);
    if (!checkBuf.equals(checkBuf2)) {
      return Err("Checksum mismatch");
    }
    return PrivKey.fromIsoBuf(decoded);
  }

  static isValidIsoStr(str: string): boolean {
    return PrivKey.fromIsoStr(str).ok;
  }
}
