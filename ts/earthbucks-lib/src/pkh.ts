import { doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

// public key hash
export default class Pkh {
  private _pkh: Buffer;

  constructor(publicKey: Buffer | Uint8Array) {
    // TODO: Remove Uint8Array type from publicKey
    this._pkh = doubleBlake3Hash(publicKey);
  }

  get pkh(): Uint8Array {
    return this._pkh;
  }
}
