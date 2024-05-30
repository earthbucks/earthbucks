import { EbxBuf } from "./ebx-buf";
import * as Hash from "./hash.js";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";

export class SignedMessage {
  sig: EbxBuf;
  pubKey: EbxBuf;
  mac: EbxBuf;
  message: EbxBuf;
  keyStr: string;

  constructor(
    sig: EbxBuf,
    pubKey: EbxBuf,
    mac: EbxBuf,
    message: EbxBuf,
    keyStr: string,
  ) {
    this.sig = sig;
    this.pubKey = pubKey;
    this.mac = mac;
    this.message = message;
    this.keyStr = keyStr;
  }

  static createMac(message: EbxBuf, keyStr: string) {
    const key = Hash.blake3Hash(EbxBuf.from(keyStr));
    return Hash.blake3Mac(key, message);
  }

  static fromSignMessage(
    privKey: PrivKey,
    message: EbxBuf,
    keyStr: string,
  ): SignedMessage {
    const mac = SignedMessage.createMac(message, keyStr);
    const sigObj = ecdsaSign(mac, privKey.toIsoBuf());
    const sigBuf = EbxBuf.from(sigObj.signature);
    const pubKey = privKey.toPubKeyIsoBuf().unwrap();
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
    if (!pubKey.toIsoBuf().equals(this.pubKey)) {
      return false;
    }
    if (!ecdsaVerify(this.sig, mac, this.pubKey)) {
      return false;
    }
    return true;
  }

  static fromIsoBuf(buf: EbxBuf, keyStr: string): SignedMessage {
    const reader = new IsoBufReader(buf);
    const sig = reader.read(64).unwrap();
    const pubKey = reader.read(PubKey.SIZE).unwrap();
    const mac = reader.read(32).unwrap();
    const message = reader.readRemainder();
    return new SignedMessage(sig, pubKey, mac, message, keyStr);
  }

  toIsoBuf(): EbxBuf {
    const writer = new IsoBufWriter();
    writer.writeIsoBuf(this.sig);
    writer.writeIsoBuf(this.pubKey);
    writer.writeIsoBuf(this.mac);
    writer.writeIsoBuf(this.message);
    return writer.toIsoBuf();
  }
}
