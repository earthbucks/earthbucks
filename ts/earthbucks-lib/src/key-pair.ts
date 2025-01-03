import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import type { FixedBuf } from "@webbuf/fixedbuf";

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

  static fromPrivKeyBuf(privKeyBuf: FixedBuf<32>): KeyPair {
    const privKey = PrivKey.fromBuf(privKeyBuf);
    const pubKey = PubKey.fromPrivKey(privKey);
    return new KeyPair(privKey, pubKey);
  }

  static fromRandom(): KeyPair {
    const privKey = PrivKey.fromRandom();
    return KeyPair.fromPrivKey(privKey);
  }

  add(keyPair: KeyPair): KeyPair {
    const privKey = this.privKey.add(keyPair.privKey);
    return KeyPair.fromPrivKey(privKey);
  }
}
