import { doubleBlake3Hash, blake3Hash } from "./blake3";
import { Buffer } from "buffer";
import bs58 from "bs58";
import IsoHex from "./iso-hex";
import PubKey from "./pub-key";
import { Result, Ok, Err } from "./result";

// public key hash
export default class Pkh {
  buf: Buffer;

  constructor(pkhBuf: Buffer) {
    this.buf = pkhBuf;
  }

  static fromPubKeyBuf(pubKeyBuf: Buffer): Pkh {
    const pkhBuf = doubleBlake3Hash(pubKeyBuf);
    return new Pkh(pkhBuf);
  }

  static fromPubKey(pubKey: PubKey): Pkh {
    return Pkh.fromPubKeyBuf(pubKey.toIsoBuf());
  }

  static fromIsoBuf(buf: Buffer): Result<Pkh, string> {
    if (buf.length !== 32) {
      return Err("Invalid public key hash length");
    }
    return Ok(new Pkh(buf));
  }

  toIsoStr(): string {
    const checkHash = blake3Hash(this.buf).subarray(0, 4);
    const checkHex = checkHash.toString("hex");
    return "ebxpkh" + checkHex + bs58.encode(this.buf);
  }

  static fromIsoStr(pkhStr: string): Result<Pkh, string> {
    if (!pkhStr.startsWith("ebxpkh")) {
      return Err("Invalid pkh format");
    }
    const checkHex = pkhStr.slice(6, 14);
    const checkBuf = IsoHex.decode(checkHex).unwrap();
    const buf = Buffer.from(bs58.decode(pkhStr.slice(14)));
    const hashBuf = blake3Hash(buf);
    const checkHash = hashBuf.subarray(0, 4);
    if (!checkHash.equals(checkBuf)) {
      return Err("Invalid pkh checksum");
    }
    return Pkh.fromIsoBuf(buf);
  }

  static isValidStringFmt(pkhStr: string): boolean {
    const pkh = Pkh.fromIsoStr(pkhStr);
    return pkh.ok;
  }
}
