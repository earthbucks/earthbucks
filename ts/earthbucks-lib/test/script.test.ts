import { describe, expect, test, beforeEach, it } from '@jest/globals'
import Script from '../src/script'

describe('Script', () => {
  test('constructor', () => {
    const script = new Script()
    expect(script.chunks).toEqual([])
  })

  test('fromString', () => {
    const script = Script.fromString('DUP DOUBLEBLAKE3')
    expect(script.chunks.length).toBe(2)
    expect(script.chunks[0].toString()).toBe('DUP')
    expect(script.chunks[1].toString()).toBe('DOUBLEBLAKE3')
  })

  test('fromString toString with PUSHDATA1', () => {
    const script = Script.fromString('0x00')
    expect(script.toString()).toBe('0x00')
  })

  test('fromString toString with PUSHDATA2', () => {
    const script = Script.fromString('0x' + '00'.repeat(256))
    expect(script.toString()).toBe('0x' + '00'.repeat(256))
  })

  test('toString', () => {
    const script = Script.fromString('DUP DOUBLEBLAKE3')
    expect(script.toString()).toBe('DUP DOUBLEBLAKE3')
  })

  test('toU8Vec and fromU8Vec', () => {
    const originalScript = Script.fromString('DUP DOUBLEBLAKE3')
    const arr = originalScript.toU8Vec()
    const script = Script.fromU8Vec(arr)
    expect(script.toString()).toBe('DUP DOUBLEBLAKE3')
  })

  test('toU8Vec and fromU8Vec with PUSHDATA1', () => {
    const originalScript = Script.fromString('0xff 0xff')
    const arr = originalScript.toU8Vec()
    const script = Script.fromU8Vec(arr)
    expect(script.toString()).toBe('0xff 0xff')
  })

  it('should correctly convert between string and Uint8Array for two PUSHDATA2 operations', () => {
    // Create a new Script from a string
    const initialScript = new Script()
    initialScript.fromString('0xffff 0xffff')

    // Convert the Script to a Uint8Array
    const arr = initialScript.toU8Vec()

    // Create a new Script from the Uint8Array
    const finalScript = new Script()
    finalScript.fromU8Vec(arr)

    // Convert the final Script back to a string
    const finalString = finalScript.toString()

    // Check that the final string matches the initial string
    expect(finalString).toEqual('0xffff 0xffff')
  })

  describe('pubkeyhash', () => {
    test('fromAddressOutput', () => {
      const script = Script.fromAddressOutput(
        new Uint8Array(Buffer.from('01'.repeat(32), 'hex')),
      )
      expect(script.toString()).toBe(
        'DUP DOUBLEBLAKE3 0x' + '01'.repeat(32) + ' EQUALVERIFY CHECKSIG',
      )
    })

    test('isAddressOutput', () => {
      const script = Script.fromAddressOutput(
        new Uint8Array(Buffer.from('01'.repeat(32), 'hex')),
      )
      expect(script.isAddressOutput()).toBe(true)
    })

    test('isAddressOutput false', () => {
      const script = Script.fromString(
        'DUP DOUBLEBLAKE3 0x01020304 EQUALVERIFY CHECKSIG',
      )
      expect(script.isAddressOutput()).toBe(false)
    })

    test('fromAddressInputPlacholder', () => {
      const script = Script.fromAddressInputPlaceholder()
      expect(script.isAddressInput()).toBe(true)
    })
  })
})
