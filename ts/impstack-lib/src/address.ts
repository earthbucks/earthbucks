import { doubleHash } from './blake3'

export default class Address {
  private _address: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._address = doubleHash(publicKey)
  }

  get address(): Uint8Array {
    return this._address
  }
}
