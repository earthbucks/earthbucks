import { Blake2BHasher } from '@napi-rs/blake-hash'

export default class Address {
  private _publicKey: Uint8Array
  private _address: Uint8Array

  constructor(publicKey: Uint8Array) {
    this._publicKey = publicKey
    const hasher = new Blake2BHasher()
    hasher.update(Buffer.from(publicKey))
    const hex = hasher.digest('hex') // could also be `base64` or `url-safe-base64`
    const arr = new Uint8Array(Buffer.from(hex, 'hex'))
    this._address = new Uint8Array(arr)
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
