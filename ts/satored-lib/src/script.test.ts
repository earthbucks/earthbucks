import { describe, expect, test, beforeEach, it } from '@jest/globals'
import Script from './script'

describe('Script', () => {
  test('constructor', () => {
    const script = new Script()
    expect(script.chunks).toEqual([])
  })

  test.only('fromString', () => {
    const script = Script.fromString('DUP HASH160')
    expect(script.chunks.length).toBe(2)
    expect(script.chunks[0].toString()).toBe('DUP')
    expect(script.chunks[1].toString()).toBe('HASH160')
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
})
