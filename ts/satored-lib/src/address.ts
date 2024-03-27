import blake3 from './blake3'

export default class Address {
  private _publicKey: Uint8Array
  private _address: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._publicKey = publicKey
    this._address = blake3(publicKey)
  }

  get publicKey(): Uint8Array {
    return this._publicKey
  }

  get address(): Uint8Array {
    return this._address
  }

  static fromPublicKey(publicKey: Uint8Array): Address {
    return new Address(publicKey)
  }
}
