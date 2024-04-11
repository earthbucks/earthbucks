import { doubleBlake3Hash } from './blake3'
import { Buffer } from 'buffer'

// public key hash
export default class Pkh {
  private _pkh: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._pkh = doubleBlake3Hash(publicKey)
  }

  get pkh(): Uint8Array {
    return this._pkh
  }
}
