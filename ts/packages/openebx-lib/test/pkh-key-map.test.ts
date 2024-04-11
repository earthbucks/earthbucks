import { describe, expect, test, beforeEach, it } from '@jest/globals'
import PkhKeyMap from '../src/pkh-key-map'
import Pkh from '../src/pkh'
import Key from '../src/key'
import { Buffer } from 'buffer'

describe('PkhKeyMap', () => {
  let pkhKeyMap: PkhKeyMap
  let key: Key
  let address: Pkh
  let addressU8Vec: Uint8Array

  beforeEach(() => {
    pkhKeyMap = new PkhKeyMap()
    key = Key.fromRandom()
    address = new Pkh(key.publicKey)
    addressU8Vec = address.pkh
  })

  test('add', () => {
    pkhKeyMap.add(key, addressU8Vec)
    expect(
      Buffer.from(pkhKeyMap.get(addressU8Vec)?.privateKey || '').toString(
        'hex',
      ),
    ).toEqual(Buffer.from(key.privateKey).toString('hex'))
  })

  test('remove', () => {
    pkhKeyMap.add(key, addressU8Vec)
    pkhKeyMap.remove(addressU8Vec)
    expect(
      Buffer.from(pkhKeyMap.get(addressU8Vec)?.privateKey || '').toString(
        'hex',
      ),
    ).toEqual('')
  })

  test('get', () => {
    pkhKeyMap.add(key, addressU8Vec)
    expect(
      Buffer.from(pkhKeyMap.get(addressU8Vec)?.privateKey || '').toString(
        'hex',
      ),
    ).toEqual(Buffer.from(key.privateKey).toString('hex'))
  })

  test('values method should return all Key values', () => {
    const key1 = key
    const key2 = Key.fromRandom()
    const address2 = new Pkh(key2.publicKey)
    const addressU8Vec2 = address2.pkh
    pkhKeyMap.add(key1, addressU8Vec)
    pkhKeyMap.add(key2, addressU8Vec2)

    const values = Array.from(pkhKeyMap.values())

    expect(values.length).toBe(2)
    expect(Buffer.from(values[0].privateKey).toString('hex')).toEqual(
      Buffer.from(key1.privateKey).toString('hex'),
    )
    expect(Buffer.from(values[1].privateKey).toString('hex')).toEqual(
      Buffer.from(key2.privateKey).toString('hex'),
    )
  })
})
