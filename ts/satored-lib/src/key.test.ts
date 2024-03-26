import { describe, expect, test } from '@jest/globals'
import Key from './key'


describe('Key', () => {
  test('Key', () => {
    const key = Key.fromRandom()
    expect(key.privateKey).toBeDefined()
    expect(key.publicKey).toBeDefined()
    expect(key.singleAddress()).toBeDefined()
    expect(key.doubleAddress()).toBeDefined()
  })

  describe('singleHash', () => {
    test('defined', () => {
      const data = new Uint8Array(32)
      expect(Key.singleHash(data)).toBeDefined()
    })
  })
})