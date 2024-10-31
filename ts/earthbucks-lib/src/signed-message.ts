import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { Hash } from "./hash.js";
import { ecdsab3Sign, ecdsab3Verify } from "./ecdsab3.js";
import type { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";

export class SignedMessage {
  sig: FixedBuf<64>;
  pubKey: FixedBuf<33>;
  mac: FixedBuf<32>;
  message: WebBuf;
  keyStr: string;

  constructor(
    sig: FixedBuf<64>,
    pubKey: FixedBuf<33>,
    mac: FixedBuf<32>,
    message: WebBuf,
    keyStr: string,
  ) {
    this.sig = sig;
    this.pubKey = pubKey;
    this.mac = mac;
    this.message = message;
    this.keyStr = keyStr;
  }

  static createMac(message: WebBuf, keyStr: string): FixedBuf<32> {
    const key = Hash.blake3Hash(WebBuf.from(keyStr));
    return Hash.blake3Mac(key, message);
  }

  static fromSignMessage(
    privKey: PrivKey,
    message: WebBuf,
    keyStr: string,
  ): SignedMessage {
    const mac = SignedMessage.createMac(message, keyStr);
    const sigBuf = ecdsab3Sign(mac, privKey);
    const pubKey = privKey.toPubKeyBuf();
    return new SignedMessage(sigBuf, pubKey, mac, message, keyStr);
  }

  isValid(pubKey: PubKey, keyStr: string): boolean {
    if (keyStr !== this.keyStr) {
      return false;
    }
    const mac = SignedMessage.createMac(this.message, this.keyStr);
    if (!mac.buf.equals(this.mac.buf)) {
      return false;
    }
    if (!pubKey.toBuf().buf.equals(this.pubKey.buf)) {
      return false;
    }
    if (!ecdsab3Verify(this.sig, mac, PubKey.fromBuf(this.pubKey))) {
      return false;
    }
    return true;
  }

  static fromBuf(buf: WebBuf, keyStr: string): SignedMessage {
    const reader = new BufReader(buf);
    const sig = reader.readFixed(64);
    const pubKey = reader.readFixed(PubKey.SIZE);
    const mac = reader.readFixed(32);
    const message = reader.readRemainder();
    return new SignedMessage(sig, pubKey, mac, message, keyStr);
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.write(this.sig.buf);
    writer.write(this.pubKey.buf);
    writer.write(this.mac.buf);
    writer.write(this.message);
    return writer.toBuf();
  }
}
