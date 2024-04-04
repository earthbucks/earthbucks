import Key from './key'

export default class PubKeyHashKeyMap {
  public map: Map<string, Key>

  constructor() {
    this.map = new Map<string, Key>()
  }

  add(key: Key, pubKeyHashU8Vec: Uint8Array): void {
    const pubKeyHashHex = Buffer.from(pubKeyHashU8Vec).toString('hex')
    this.map.set(pubKeyHashHex, key)
  }

  remove(pubKeyHashU8Vec: Uint8Array): void {
    const pubKeyHashHex = Buffer.from(pubKeyHashU8Vec).toString('hex')
    this.map.delete(pubKeyHashHex)
  }

  get(pubKeyHashU8Vec: Uint8Array): Key | undefined {
    const pubKeyHashHex = Buffer.from(pubKeyHashU8Vec).toString('hex')
    return this.map.get(pubKeyHashHex)
  }

  values(): IterableIterator<Key> {
    return this.map.values()
  }
}
