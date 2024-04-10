import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TxInput from '../src/tx-input'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'
import { Buffer } from 'buffer'

describe('TxInput', () => {
  test('should create a TxInput', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script()
    const sequence = 0xffffffff

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    expect(txInput).toBeInstanceOf(TxInput)
    expect(txInput.inputTxId).toBe(inputTxHash)
    expect(txInput.inputTxOutNum).toBe(inputTxIndex)
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
      expect(result.inputTxOutNum).toEqual(inputTxIndex)
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

  test('isNull', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script().fromString('0x121212')
    const sequence = 0

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    expect(txInput.isNull()).toBe(false)

    const nullTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    )
    expect(nullTxInput.isNull()).toBe(true)
  })

  test('isFinal', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script().fromString('0x121212')
    const sequence = 0

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    expect(txInput.isFinal()).toBe(false)

    const finalTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    )
    expect(finalTxInput.isFinal()).toBe(true)
  })

  test('isCoinbase', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script().fromString('0x121212')
    const sequence = 0

    const txInput = new TxInput(inputTxHash, inputTxIndex, script, sequence)
    expect(txInput.isCoinbase()).toBe(false)

    const coinbaseTxInput = new TxInput(
      Buffer.alloc(32),
      0xffffffff,
      new Script(),
      0xffffffff,
    )
    expect(coinbaseTxInput.isCoinbase()).toBe(true)
  })

  test('fromCoinbase', () => {
    const script = new Script().fromString('0x121212')
    const txInput = TxInput.fromCoinbase(script)
    expect(txInput).toBeInstanceOf(TxInput)
    expect(txInput.isNull()).toBe(true)
    expect(txInput.isFinal()).toBe(true)
    expect(txInput.script.toString()).toEqual(script.toString())
  })
})
