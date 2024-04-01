import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionInput from '../src/transaction-input'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'

describe('TransactionInput', () => {
  test('should create a TransactionInput', () => {
    const inputTxHash = Buffer.alloc(32)
    const inputTxIndex = 0
    const script = new Script()
    const sequence = 0xffffffff

    const transactionInput = new TransactionInput(
      inputTxHash,
      inputTxIndex,
      script,
      sequence,
    )
    expect(transactionInput).toBeInstanceOf(TransactionInput)
    expect(transactionInput.inputTxHash).toBe(inputTxHash)
    expect(transactionInput.inputTxIndex).toBe(inputTxIndex)
    expect(transactionInput.script).toBe(script)
    expect(transactionInput.sequence).toBe(sequence)
  })

  describe('fromBufferReader', () => {
    test('fromBufferReader', () => {
      const inputTxHash = new Uint8Array(Buffer.alloc(32))
      const inputTxIndex = 0
      const script = new Script()
      const sequence = 0xffffffff

      const transactionInput = new TransactionInput(
        inputTxHash,
        inputTxIndex,
        script,
        sequence,
      )

      const reader = new BufferReader(transactionInput.toBuffer())
      const result = TransactionInput.fromBufferReader(reader)
      expect(result).toBeInstanceOf(TransactionInput)
      expect(Buffer.from(result.inputTxHash).toString('hex')).toEqual(
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

      const transactionInput = new TransactionInput(
        inputTxHash,
        inputTxIndex,
        script,
        sequence,
      )
      const result = transactionInput.toBuffer()
      expect(result.toString('hex')).toEqual(
        '00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff',
      )
    })

    test('toBuffer with script', () => {
      const inputTxHash = Buffer.alloc(32)
      const inputTxIndex = 0
      const script = new Script().fromString('DOUBLEBLAKE3')
      const sequence = 0xffffffff

      const transactionInput = new TransactionInput(
        inputTxHash,
        inputTxIndex,
        script,
        sequence,
      )
      const result = transactionInput.toBuffer()
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

    const transactionInput = new TransactionInput(
      inputTxHash,
      inputTxIndex,
      script,
      sequence,
    )
    const result = transactionInput.toBuffer()
    expect(result.toString('hex')).toEqual(
      '000000000000000000000000000000000000000000000000000000000000000000000000054c03121212ffffffff',
    )
  })
})
