import PrivKey from "./priv-key";
import PubKey from "./pub-key";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";

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

  static fromPrivKeyBuffer(privKeyBuf: Buffer): Result<KeyPair, string> {
    try {
      let privKey = PrivKey.fromIsoBuf(Buffer.from(privKeyBuf))
        .mapErr((err) => "Error parsing private key: " + err)
        .unwrap();

      let pubKey = PubKey.fromPrivKey(privKey);
      return new Ok(new KeyPair(privKey, pubKey));
    } catch (err) {
      return new Err(err?.toString() || "Unknown error creating key pair");
    }
  }

  static fromRandom(): KeyPair {
    let privKey = PrivKey.fromRandom();
    return KeyPair.fromPrivKey(privKey);
  }
}
