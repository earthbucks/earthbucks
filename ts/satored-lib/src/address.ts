import blake3 from './blake3'

export default class Address {
  private _address: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._address = blake3(publicKey)
  }

  get address(): Uint8Array {
    return this._address
  }
}
