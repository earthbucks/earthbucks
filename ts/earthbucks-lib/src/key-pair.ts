import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { FixedIsoBuf, SysBuf } from "./iso-buf.js";

export class KeyPair {
  privKey: PrivKey;
  pubKey: PubKey;

  constructor(privKey: PrivKey, pubKey: PubKey) {
    this.privKey = privKey;
    this.pubKey = pubKey;
  }

  static fromPrivKey(privKey: PrivKey): KeyPair {
    const pubKey = PubKey.fromPrivKey(privKey);
    return new KeyPair(privKey, pubKey);
  }

  static fromPrivKeyIsoBuf(privKeyBuf: FixedIsoBuf<32>): KeyPair {
    const privKey = PrivKey.fromIsoBuf(privKeyBuf);
    const pubKey = PubKey.fromPrivKey(privKey);
    return new KeyPair(privKey, pubKey);
  }

  static fromRandom(): KeyPair {
    const privKey = PrivKey.fromRandom();
    return KeyPair.fromPrivKey(privKey);
  }
}
