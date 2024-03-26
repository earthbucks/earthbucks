import { describe, expect, test } from '@jest/globals'
import Key from './key'
import fs from 'fs'
import path from 'path'

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

  describe('standard test vectors: key.json', () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, '../../../json/key.json'),
      'utf-8',
    )

    test('key pairs', () => {
      interface KeyPair {
        priv_key: string
        pub_key: string
      }
      const keyPairs: KeyPair[] = JSON.parse(data).key_pair

      for (const pair of keyPairs) {
        const privKeyBuf = Buffer.from(pair.priv_key, 'hex')
        const privKey = new Uint8Array(privKeyBuf)
        const key = new Key(privKey)
        expect(Buffer.from(key.publicKey).toString('hex')).toBe(pair.pub_key)
      }
    })
  })
})
