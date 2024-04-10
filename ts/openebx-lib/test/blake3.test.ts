import { describe, expect, test, beforeEach, it } from '@jest/globals'
import { blake3Hash, doubleBlake3Hash } from '../src/blake3'
import { Buffer } from 'buffer'

describe('blake3', () => {
  test('hash', () => {
    const pub_key_hex =
      '03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722'
    const expected_address_hex =
      '38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d'

    // Convert hex to bytes
    const pub_key = Buffer.from(pub_key_hex, 'hex')
    const expected_address = Buffer.from(expected_address_hex, 'hex')

    // Compute the hash of the public key
    const address = Buffer.from(blake3Hash(pub_key))

    // Check that the computed address matches the expected address
    expect(address.toString('hex')).toEqual(expected_address.toString('hex'))
  })

  test('doubleHash', () => {
    const pub_key_hex =
      '0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628'
    const expected_address_hex =
      '51544e51d07a92f41854bd2a14d0f33dcbc936b8910eb9c699b656cd89308132'

    // Convert hex to bytes
    const pub_key = Buffer.from(pub_key_hex, 'hex')
    const expected_address = Buffer.from(expected_address_hex, 'hex')

    // Compute the hash of the public key
    const address = Buffer.from(doubleBlake3Hash(pub_key))

    // Check that the computed address matches the expected address
    expect(address.toString('hex')).toEqual(expected_address.toString('hex'))
  })
})
