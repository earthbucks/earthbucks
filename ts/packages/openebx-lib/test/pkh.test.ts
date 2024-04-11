import { describe, expect, test } from '@jest/globals'
import Key from '../src/key'
import fs from 'fs'
import path from 'path'
import Pkh from '../src/pkh'
import { Buffer } from 'buffer'

describe('Pkh', () => {
  test('Pkh', () => {
    const key = Key.fromRandom()
    const address = new Pkh(key.publicKey)
    expect(address.pkh).toBeDefined()
  })

  describe('standard test vectors: address.json', () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, '../../../../json/address.json'),
      'utf-8',
    )

    test('address pairs', () => {
      interface AddressPair {
        pub_key: string
        address: string
      }
      const addressPairs: AddressPair[] = JSON.parse(data).address

      for (const pair of addressPairs) {
        const pubKeyBuf = Buffer.from(pair.pub_key, 'hex')
        const pubKey = new Uint8Array(pubKeyBuf)
        const address = new Pkh(pubKey)
        expect(Buffer.from(address.pkh).toString('hex')).toBe(pair.address)
      }
    })
  })
})
