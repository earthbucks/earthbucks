import secp256k1 from "secp256k1";
import crypto from "crypto";
import { Buffer } from "buffer";

export default class Key {
  private _privateKey: Uint8Array;
  private _publicKey: Uint8Array;

  constructor(privateKey: Uint8Array) {
    this._privateKey = privateKey;
    this._publicKey = secp256k1.publicKeyCreate(privateKey);
  }

  get privateKey(): Uint8Array {
    return this._privateKey;
  }

  get publicKey(): Uint8Array {
    return this._publicKey;
  }

  static fromRandom(): Key {
    let privateKey;
    do {
      privateKey = crypto.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    return new Key(privateKey);
  }
}
