import { FixedEbxBuf, SysBuf } from "./ebx-buf.js";
import * as Hash from "./hash.js";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";

export class SignedMessage {
  sig: FixedEbxBuf<64>;
  pubKey: FixedEbxBuf<33>;
  mac: FixedEbxBuf<32>;
  message: SysBuf;
  keyStr: string;

  constructor(
    sig: FixedEbxBuf<64>,
    pubKey: FixedEbxBuf<33>,
    mac: FixedEbxBuf<32>,
    message: SysBuf,
    keyStr: string,
  ) {
    this.sig = sig;
    this.pubKey = pubKey;
    this.mac = mac;
    this.message = message;
    this.keyStr = keyStr;
  }

  static createMac(message: SysBuf, keyStr: string) {
    const key = Hash.blake3Hash(SysBuf.from(keyStr));
    return Hash.blake3Mac(key, message);
  }

  static fromSignMessage(
    privKey: PrivKey,
    message: SysBuf,
    keyStr: string,
  ): SignedMessage {
    const mac = SignedMessage.createMac(message, keyStr);
    const sigObj = ecdsaSign(mac, privKey.toEbxBuf());
    const sigBuf = (FixedEbxBuf<64>).fromBuf(64, SysBuf.from(sigObj.signature));
    const pubKey = privKey.toPubKeyEbxBuf();
    return new SignedMessage(sigBuf, pubKey, mac, message, keyStr);
  }

  isValid(pubKey: PubKey, keyStr: string): boolean {
    if (keyStr !== this.keyStr) {
      return false;
    }
    const mac = SignedMessage.createMac(this.message, this.keyStr);
    if (!mac.equals(this.mac)) {
      return false;
    }
    if (!pubKey.toEbxBuf().equals(this.pubKey)) {
      return false;
    }
    if (!ecdsaVerify(this.sig, mac, this.pubKey)) {
      return false;
    }
    return true;
  }

  static fromEbxBuf(buf: SysBuf, keyStr: string): SignedMessage {
    const reader = new BufReader(buf);
    const sig = reader.readFixed(64);
    const pubKey = reader.readFixed(PubKey.SIZE);
    const mac = reader.readFixed(32);
    const message = reader.readRemainder();
    return new SignedMessage(sig, pubKey, mac, message, keyStr);
  }

  toEbxBuf(): SysBuf {
    const writer = new BufWriter();
    writer.write(this.sig);
    writer.write(this.pubKey);
    writer.write(this.mac);
    writer.write(this.message);
    return writer.toSysBuf();
  }
}
