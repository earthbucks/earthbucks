import { Buffer } from "buffer";
import { blake3Hash, blake3Mac } from "./blake3";
import { ecdsaSign, ecdsaVerify } from "secp256k1";
import PrivKey from "./priv-key";
import PubKey from "./pub-key";
import BufferReader from "./buffer-reader";
import BufferWriter from "./buffer-writer";

const MAC_KEY = blake3Hash(Buffer.from("signed message"));

export default class SignedMessage {
  sig: Buffer;
  pubKey: Buffer;
  mac: Buffer;
  message: Buffer;

  constructor(sig: Buffer, pubKey: Buffer, mac: Buffer, message: Buffer) {
    this.sig = sig;
    this.pubKey = pubKey;
    this.mac = mac;
    this.message = message;
  }

  static createMac(message: Buffer) {
    return blake3Mac(MAC_KEY, message);
  }

  static fromSignMessage(privKey: PrivKey, message: Buffer): SignedMessage {
    const mac = SignedMessage.createMac(message);
    const sigObj = ecdsaSign(mac, privKey.toBuffer());
    const sigBuf = Buffer.from(sigObj.signature);
    let pubKey = privKey.toPubKeyBuffer();
    return new SignedMessage(sigBuf, pubKey, mac, message);
  }

  verify(pubKey: PubKey): boolean {
    let mac = SignedMessage.createMac(this.message);
    if (!mac.equals(this.mac)) {
      return false;
    }
    if (!pubKey.toBuffer().equals(this.pubKey)) {
      return false;
    }
    if (!ecdsaVerify(this.sig, mac, this.pubKey)) {
      return false;
    }
    return true;
  }

  static fromBuffer(buf: Buffer): SignedMessage {
    const reader = new BufferReader(buf);
    const sig = reader.readBuffer(65);
    const pubKey = reader.readBuffer(33);
    const mac = reader.readBuffer(32);
    const message = reader.readBuffer();
    return new SignedMessage(sig, pubKey, mac, message);
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter();
    writer.writeBuffer(this.sig);
    writer.writeBuffer(this.pubKey);
    writer.writeBuffer(this.mac);
    writer.writeBuffer(this.message);
    return writer.toBuffer();
  }
}
