import { describe, expect, test } from '@jest/globals'
import Key from './key'
import fs from 'fs'
import path from 'path'
import Address from './address'

describe('Address', () => {
  test('Address', () => {
    const key = Key.fromRandom()
    const address = new Address(key.publicKey)
    expect(address.address).toBeDefined()
  })

  describe('standard test vectors: address.json', () => {
    const data = fs.readFileSync(
      path.resolve(__dirname, '../../../json/address.json'),
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
        const address = new Address(pubKey)
        expect(Buffer.from(address.address).toString('hex')).toBe(pair.address)
      }
    })
  })
})
