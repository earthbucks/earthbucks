import { describe, expect, test, beforeEach, it } from '@jest/globals'
import Script from './script'

describe('Script', () => {
  test('constructor', () => {
    const script = new Script()
    expect(script.chunks).toEqual([])
  })

  test('fromString', () => {
    const script = Script.fromString('DUP HASH160')
    expect(script.chunks.length).toBe(2)
    expect(script.chunks[0].toString()).toBe('DUP')
    expect(script.chunks[1].toString()).toBe('HASH160')
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
    const script = Script.fromString('DUP HASH160')
    expect(script.toString()).toBe('DUP HASH160')
  })

  test('toUint8Array and fromUint8Array', () => {
    const originalScript = Script.fromString('DUP HASH160')
    const arr = originalScript.toUint8Array()
    const script = Script.fromUint8Array(arr)
    expect(script.toString()).toBe('DUP HASH160')
  })

  test('toUint8Array and fromUint8Array with PUSHDATA1', () => {
    const originalScript = Script.fromString('0xff 0xff')
    const arr = originalScript.toUint8Array()
    const script = Script.fromUint8Array(arr)
    expect(script.toString()).toBe('0xff 0xff')
  })

  it('should correctly convert between string and Uint8Array for two PUSHDATA2 operations', () => {
    // Create a new Script from a string
    const initialScript = new Script();
    initialScript.fromString('0xffff 0xffff');

    // Convert the Script to a Uint8Array
    const arr = initialScript.toUint8Array();

    // Create a new Script from the Uint8Array
    const finalScript = new Script();
    finalScript.fromUint8Array(arr);

    // Convert the final Script back to a string
    const finalString = finalScript.toString();

    // Check that the final string matches the initial string
    expect(finalString).toEqual('0xffff 0xffff');
  });
})
