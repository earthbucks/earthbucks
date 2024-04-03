import { describe, expect, test, beforeEach, it } from '@jest/globals'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'
import PubKeyHash from '../src/pub-key-hash'
import Key from '../src/key'

describe('PubKeyHashKeyMap', () => {
  let pubKeyHashKeyMap: PubKeyHashKeyMap
  let key: Key
  let pubKeyHash: PubKeyHash
  let pubKeyHashU8Vec: Uint8Array

  beforeEach(() => {
    pubKeyHashKeyMap = new PubKeyHashKeyMap()
    key = Key.fromRandom()
    pubKeyHash = new PubKeyHash(key.publicKey)
    pubKeyHashU8Vec = pubKeyHash.pubKeyHash
  })

  test('add', () => {
    pubKeyHashKeyMap.add(key, pubKeyHashU8Vec)
    expect(
      Buffer.from(
        pubKeyHashKeyMap.get(pubKeyHashU8Vec)?.privateKey || '',
      ).toString('hex'),
    ).toEqual(Buffer.from(key.privateKey).toString('hex'))
  })

  test('remove', () => {
    pubKeyHashKeyMap.add(key, pubKeyHashU8Vec)
    pubKeyHashKeyMap.remove(pubKeyHashU8Vec)
    expect(
      Buffer.from(
        pubKeyHashKeyMap.get(pubKeyHashU8Vec)?.privateKey || '',
      ).toString('hex'),
    ).toEqual('')
  })

  test('get', () => {
    pubKeyHashKeyMap.add(key, pubKeyHashU8Vec)
    expect(
      Buffer.from(
        pubKeyHashKeyMap.get(pubKeyHashU8Vec)?.privateKey || '',
      ).toString('hex'),
    ).toEqual(Buffer.from(key.privateKey).toString('hex'))
  })

  test('values method should return all Key values', () => {
    const key1 = key
    const key2 = Key.fromRandom()
    const pubKeyHash2 = new PubKeyHash(key2.publicKey)
    const pubKeyHashU8Vec2 = pubKeyHash2.pubKeyHash
    pubKeyHashKeyMap.add(key1, pubKeyHashU8Vec)
    pubKeyHashKeyMap.add(key2, pubKeyHashU8Vec2)

    const values = Array.from(pubKeyHashKeyMap.values())

    expect(values.length).toBe(2)
    expect(Buffer.from(values[0].privateKey).toString('hex')).toEqual(
      Buffer.from(key1.privateKey).toString('hex'),
    )
    expect(Buffer.from(values[1].privateKey).toString('hex')).toEqual(
      Buffer.from(key2.privateKey).toString('hex'),
    )
  })
})
