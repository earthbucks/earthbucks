import { Buffer } from "buffer";
import { blake3Hash, blake3Mac } from "../blake3";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import PrivKey from "../priv-key";
import PubKey from "../pub-key";
import BufferReader from "../buffer-reader";
import BufferWriter from "../buffer-writer";

export default class SignedMessage {
  sig: Buffer;
  pubKey: Buffer;
  mac: Buffer;
  message: Buffer;
  keyStr: string;

  constructor(
    sig: Buffer,
    pubKey: Buffer,
    mac: Buffer,
    message: Buffer,
    keyStr: string,
  ) {
    this.sig = sig;
    this.pubKey = pubKey;
    this.mac = mac;
    this.message = message;
    this.keyStr = keyStr;
  }

  static createMac(message: Buffer, keyStr: string) {
    let key = blake3Hash(Buffer.from(keyStr));
    return blake3Mac(key, message);
  }

  static fromSignMessage(
    privKey: PrivKey,
    message: Buffer,
    keyStr: string,
  ): SignedMessage {
    const mac = SignedMessage.createMac(message, keyStr);
    const sigObj = ecdsaSign(mac, privKey.toBuffer());
    const sigBuf = Buffer.from(sigObj.signature);
    let pubKey = privKey.toPubKeyBuffer();
    return new SignedMessage(sigBuf, pubKey, mac, message, keyStr);
  }

  isValid(pubKey: PubKey, keyStr: string): boolean {
    if (keyStr !== this.keyStr) {
      return false;
    }
    let mac = SignedMessage.createMac(this.message, this.keyStr);
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

  static fromBuffer(buf: Buffer, keyStr: string): SignedMessage {
    const reader = new BufferReader(buf);
    const sig = reader.readBuffer(64);
    const pubKey = reader.readBuffer(33);
    const mac = reader.readBuffer(32);
    const message = reader.readRemainder();
    return new SignedMessage(sig, pubKey, mac, message, keyStr);
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
