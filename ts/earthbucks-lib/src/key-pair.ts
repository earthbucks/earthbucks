import PrivKey from "./priv-key";
import PubKey from "./pub-key";
import { Buffer } from "buffer";

export default class KeyPair {
  privKey: PrivKey;
  pubKey: PubKey;

  constructor(privKey: PrivKey, pubKey: PubKey) {
    this.privKey = privKey;
    this.pubKey = pubKey;
  }

  static fromPrivKey(privKey: PrivKey): KeyPair {
    let pubKey = PubKey.fromPrivKey(privKey);
    return new KeyPair(privKey, pubKey);
  }

  static fromPrivKeyBuffer(privKeyBuf: Buffer) {
    let privKey = PrivKey.fromBuffer(Buffer.from(privKeyBuf));
    let pubKey = PubKey.fromPrivKey(privKey);
    return new KeyPair(privKey, pubKey);
  }

  static fromRandom(): KeyPair {
    let privKey = PrivKey.fromRandom();
    return KeyPair.fromPrivKey(privKey);
  }
}
