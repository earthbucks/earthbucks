import { describe, expect, test, beforeEach, it } from '@jest/globals'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'
import PubKeyHash from '../src/pub-key-hash'
import Key from '../src/key'

describe('AddressKeyMap', () => {
  let addressKeyMap: PubKeyHashKeyMap
  let key: Key
  let address: PubKeyHash
  let addressU8Vec: Uint8Array

  beforeEach(() => {
    addressKeyMap = new PubKeyHashKeyMap()
    key = Key.fromRandom()
    address = new PubKeyHash(key.publicKey)
    addressU8Vec = address.address
  })

  test('add', () => {
    addressKeyMap.add(key, addressU8Vec)
    expect(addressKeyMap.get(addressU8Vec)).toBe(key)
  })

  test('remove', () => {
    addressKeyMap.add(key, addressU8Vec)
    addressKeyMap.remove(addressU8Vec)
    expect(addressKeyMap.get(addressU8Vec)).toBeUndefined()
  })

  test('get', () => {
    addressKeyMap.add(key, addressU8Vec)
    expect(addressKeyMap.get(addressU8Vec)).toBe(key)
  })

  test('values method should return all Key values', () => {
    const key1 = key
    const key2 = Key.fromRandom()
    const address2 = new PubKeyHash(key2.publicKey)
    const addressU8Vec2 = address2.address
    addressKeyMap.add(key1, addressU8Vec)
    addressKeyMap.add(key2, addressU8Vec2)

    const values = Array.from(addressKeyMap.values())

    expect(values.length).toBe(2)
    expect(values).toContain(key1)
    expect(values).toContain(key2)
  })
})
