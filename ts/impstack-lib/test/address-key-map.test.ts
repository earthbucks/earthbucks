import { describe, expect, test, beforeEach, it } from '@jest/globals'
import AddressKeyMap from '../src/address-key-map'
import Address from '../src/address'
import Key from '../src/key'

describe('AddressKeyMap', () => {
  let addressKeyMap: AddressKeyMap
  let key: Key
  let address: Address
  let addressU8Vec: Uint8Array

  beforeEach(() => {
    addressKeyMap = new AddressKeyMap()
    key = Key.fromRandom()
    address = new Address(key.publicKey)
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
    const address2 = new Address(key2.publicKey)
    const addressU8Vec2 = address2.address
    addressKeyMap.add(key1, addressU8Vec)
    addressKeyMap.add(key2, addressU8Vec2)

    const values = Array.from(addressKeyMap.values())

    expect(values.length).toBe(2)
    expect(values).toContain(key1)
    expect(values).toContain(key2)
  })
})
