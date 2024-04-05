import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TxInput from '../src/tx-input'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'

describe('TxInput', () => {
  test('should create a TxInput', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script()
    const sequence = 0xffffffff

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    expect(txInput).toBeInstanceOf(TxInput)
    expect(txInput.inputTxId).toBe(inputTxHash)
    expect(txInput.inputTxIndex).toBe(inputTxIndex)
    expect(txInput.script).toBe(script)
    expect(txInput.sequence).toBe(sequence)
  })

  describe('fromBufferReader', () => {
    test('fromBufferReader', () => {
      const inputTxHash = new Uint8Array(Buffer.alloc(32))
      const inputTxIndex = 0
      const script = new Script()
      const sequence = 0xffffffff

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)

      const reader = new BufferReader(txInput.toBuffer())
      const result = TxInput.fromBufferReader(reader)
      expect(result).toBeInstanceOf(TxInput)
      expect(Buffer.from(result.inputTxId).toString('hex')).toEqual(
        Buffer.from(inputTxHash).toString('hex'),
      )
      expect(result.inputTxIndex).toEqual(inputTxIndex)
      expect(result.script.toString()).toEqual(script.toString())
      expect(result.sequence).toEqual(sequence)
    })
  })

  describe('toBuffer', () => {
    test('toBuffer', () => {
      const inputTxHash = Buffer.alloc(32)
      const inputTxIndex = 0
      const script = new Script()
      const sequence = 0xffffffff

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
      const result = txInput.toBuffer()
      expect(result.toString('hex')).toEqual(
        '00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff',
      )
    })

    test('toBuffer with script', () => {
      const inputTxHash = Buffer.alloc(32)
      const inputTxIndex = 0
      const script = new Script().fromString('DOUBLEBLAKE3')
      const sequence = 0xffffffff

      const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
      const result = txInput.toBuffer()
      expect(result.toString('hex')).toEqual(
        '00000000000000000000000000000000000000000000000000000000000000000000000001a7ffffffff',
      )
    })
  })

  test('toBuffer with pushdata', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script().fromString('0x121212')
    const sequence = 0xffffffff

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    const result = txInput.toBuffer()
    expect(result.toString('hex')).toEqual(
      '000000000000000000000000000000000000000000000000000000000000000000000000054c03121212ffffffff',
    )
  })
})
