import secp256k1 from 'secp256k1'
import crypto from 'crypto'

export class Key {
  private _privateKey: Uint8Array
  private _publicKey: Uint8Array

  constructor(privateKey: Uint8Array) {
    this._privateKey = privateKey
    this._publicKey = secp256k1.publicKeyCreate(privateKey)
  }

  get privateKey(): Uint8Array {
    return this._privateKey
  }

  get publicKey(): Uint8Array {
    return this._publicKey
  }

  static singleHash(data: Uint8Array): Uint8Array {
    const res = crypto.createHash('sha256').update(data).digest()
    const uintArray = new Uint8Array(res.buffer)
    return uintArray
  }

  static doubleHash(data: Uint8Array): Uint8Array {
    return this.singleHash(this.singleHash(data))
  }

  singleAddress(): Uint8Array {
    return Key.singleHash(this._publicKey)
  }

  doubleAddress(): Uint8Array {
    return Key.doubleHash(this._publicKey)
  }
}
