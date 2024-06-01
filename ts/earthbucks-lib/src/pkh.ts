import * as Hash from "./hash.js";
import { SysBuf, IsoBuf, FixedIsoBuf } from "./iso-buf.js";
import { PubKey } from "./pub-key.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";

// public key hash
export class Pkh {
  buf: FixedIsoBuf<32>;

  constructor(pkhBuf: FixedIsoBuf<32>) {
    this.buf = pkhBuf;
  }

  static fromPubKeyBuf(pubKeyBuf: FixedIsoBuf<33>): Pkh {
    const pkhBuf = Hash.doubleBlake3Hash(pubKeyBuf);
    return new Pkh(pkhBuf);
  }

  static fromPubKey(pubKey: PubKey): Pkh {
    return Pkh.fromPubKeyBuf(pubKey.toIsoBuf());
  }

  static fromIsoBuf(buf: FixedIsoBuf<32>): Result<Pkh, string> {
    if (buf.length !== 32) {
      return Err("Invalid public key hash length");
    }
    return Ok(new Pkh(buf));
  }

  toIsoStr(): string {
    const checkHash = Hash.blake3Hash(this.buf).subarray(0, 4);
    const checkHex = checkHash.toString("hex");
    return "ebxpkh" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(pkhStr: string): Result<Pkh, string> {
    if (!pkhStr.startsWith("ebxpkh")) {
      return Err("Invalid pkh format");
    }
    const checkHex = pkhStr.slice(6, 14);
    const checkBufRes = FixedIsoBuf.fromStrictHex(4, checkHex);
    if (checkBufRes.err) {
      return Err("Invalid pkh checksum");
    }
    const checkBuf = checkBufRes.unwrap();
    const bufRes = (FixedIsoBuf<32>).fromBase58(32, pkhStr.slice(14));
    if (bufRes.err) {
      return Err("Invalid pkh length");
    }
    const buf = bufRes.unwrap();
    const hashBuf = Hash.blake3Hash(buf);
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
