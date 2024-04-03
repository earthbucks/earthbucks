import { describe, expect, test } from '@jest/globals'
import Key from '../src/key'
import fs from 'fs'
import path from 'path'
import PubKeyHash from '../src/pub-key-hash'

describe('PubKeyHash', () => {
  test('PubKeyHash', () => {
    const key = Key.fromRandom()
    const pubKeyHash = new PubKeyHash(key.publicKey)
    expect(pubKeyHash.pubKeyHash).toBeDefined()
  })

  describe('standard test vectors: pub_key_hash.json', () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, '../../../json/pub_key_hash.json'),
      'utf-8',
    )

    test('pubKeyHash pairs', () => {
      interface PubKeyHashPair {
        pub_key: string
        pub_key_hash: string
      }
      const pubKeyHashPairs: PubKeyHashPair[] = JSON.parse(data).pub_key_hash

      for (const pair of pubKeyHashPairs) {
        const pubKeyBuf = Buffer.from(pair.pub_key, 'hex')
        const pubKey = new Uint8Array(pubKeyBuf)
        const pubKeyHash = new PubKeyHash(pubKey)
        expect(Buffer.from(pubKeyHash.pubKeyHash).toString('hex')).toBe(
          pair.pub_key_hash,
        )
      }
    })
  })
})
