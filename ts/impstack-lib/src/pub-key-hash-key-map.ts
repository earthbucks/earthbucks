import Key from './key'

export default class PubKeyHashKeyMap {
  public map: Map<string, Key>

  constructor() {
    this.map = new Map<string, Key>()
  }

  add(key: Key, addressU8Vec: Uint8Array): void {
    const addressHex = Buffer.from(addressU8Vec).toString('hex')
    this.map.set(addressHex, key)
  }

  remove(addressU8Vec: Uint8Array): void {
    const addressHex = Buffer.from(addressU8Vec).toString('hex')
    this.map.delete(addressHex)
  }

  get(addressU8Vec: Uint8Array): Key | undefined {
    const addressHex = Buffer.from(addressU8Vec).toString('hex')
    return this.map.get(addressHex)
  }

  values(): IterableIterator<Key> {
    return this.map.values()
  }
}
