import {
  EbxError,
  InvalidChecksumError,
  InvalidEncodingError,
} from "./ebx-error.js";
import * as Hash from "./hash.js";
import { SysBuf, IsoBuf, FixedIsoBuf } from "./iso-buf.js";
import { PubKey } from "./pub-key.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { Option, None, Some } from "earthbucks-opt-res/src/option.js";
import { InvalidSizeError } from "./ebx-error.js";

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

  static fromIsoBuf(buf: FixedIsoBuf<32>): Pkh {
    return new Pkh(buf);
  }

  toIsoStr(): string {
    const checkHash = Hash.blake3Hash(this.buf).subarray(0, 4);
    const checkHex = checkHash.toString("hex");
    return "ebxpkh" + checkHex + this.buf.toBase58();
  }

  static fromIsoStr(pkhStr: string): Result<Pkh, EbxError> {
    if (!pkhStr.startsWith("ebxpkh")) {
      return Err(new InvalidEncodingError(None));
    }
    const checkHex = pkhStr.slice(6, 14);
    const checkBufRes = FixedIsoBuf.fromStrictHex(4, checkHex);
    if (checkBufRes.err) {
      return Err(new InvalidChecksumError(None));
    }
    const checkBuf = checkBufRes.unwrap();
    const bufRes = (FixedIsoBuf<32>).fromBase58(32, pkhStr.slice(14));
    if (bufRes.err) {
      return Err(new InvalidSizeError(None));
    }
    const buf = bufRes.unwrap();
    const hashBuf = Hash.blake3Hash(buf);
    const checkHash = hashBuf.subarray(0, 4);
    if (!checkHash.equals(checkBuf)) {
      return Err(new InvalidChecksumError(None));
    }
    return Ok(Pkh.fromIsoBuf(buf));
  }

  static isValidStringFmt(pkhStr: string): boolean {
    const pkh = Pkh.fromIsoStr(pkhStr);
    return pkh.ok;
  }
}
