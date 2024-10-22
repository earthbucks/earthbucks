import {
  private_key_verify,
  public_key_create,
  private_key_add,
} from "@earthbucks/secp256k1";
import { WebBuf, FixedBuf } from "./buf.js";
import { Hash } from "./hash.js";

export class PrivKey {
  buf: FixedBuf<32>;

  constructor(buf: FixedBuf<32>) {
    this.buf = buf;
  }

  static fromRandom(): PrivKey {
    let privKeyBuf: FixedBuf<32>;
    do {
      privKeyBuf = FixedBuf.fromRandom(32);
    } while (!private_key_verify(privKeyBuf.buf));
    return new PrivKey(privKeyBuf);
  }

  toBuf(): FixedBuf<32> {
    return this.buf;
  }

  toPubKeyEbxBuf(): FixedBuf<33> {
    return FixedBuf.fromBuf(33, WebBuf.from(public_key_create(this.buf.buf)));
  }

  toPubKeyHex(): string {
    return this.toPubKeyEbxBuf().toHex();
  }

  static fromBuf(buf: FixedBuf<32>): PrivKey {
    if (!private_key_verify(buf.buf)) {
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
    return `ebxprv${checkHex}${this.buf.toBase58()}`;
  }

  static fromString(str: string): PrivKey {
    if (!str.startsWith("ebxprv")) {
      throw new Error("invalid encoding");
    }
    const hexStr = str.slice(6, 14);
    const checkBuf = FixedBuf.fromHex(4, hexStr);
    const decoded32 = FixedBuf.fromBase58(32, str.slice(14));
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
    const arr = private_key_add(
      WebBuf.from(this.buf.buf),
      WebBuf.from(privKey.buf.buf),
    );
    const buf = FixedBuf.fromBuf(32, WebBuf.from(arr));
    return PrivKey.fromBuf(buf);
  }
}
