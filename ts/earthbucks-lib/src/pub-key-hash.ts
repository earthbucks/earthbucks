import { doubleBlake3Hash } from './blake3'

export default class PubKeyHash {
  private _pubKeyHash: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._pubKeyHash = doubleBlake3Hash(publicKey)
  }

  get pubKeyHash(): Uint8Array {
    return this._pubKeyHash
  }
}
