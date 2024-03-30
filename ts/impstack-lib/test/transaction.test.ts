import { describe, expect, test, beforeEach, it } from '@jest/globals'
import Transaction from '../src/transaction'
import TransactionInput from '../src/transaction-input'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'
import BufferWriter from '../src/buffer-writer'

describe('Transaction', () => {
  describe('constructor', () => {
    test('should create a Transaction', () => {
      const version = 1
      const inputs: TransactionInput[] = []
      const outputs: TransactionOutput[] = []
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)
      expect(transaction).toBeInstanceOf(Transaction)
      expect(transaction.version).toBe(version)
      expect(transaction.inputs).toBe(inputs)
      expect(transaction.outputs).toBe(outputs)
      expect(transaction.locktime).toBe(locktime)
    })
  })

  test('to/from u8Vec', () => {
    const version = 1
    const inputs: TransactionInput[] = [
      new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
    ]
    const outputs: TransactionOutput[] = [
      new TransactionOutput(BigInt(100), new Script()),
    ]
    const locktime = BigInt(0)

    const transaction = new Transaction(version, inputs, outputs, locktime)
    const result = Transaction.fromU8Vec(transaction.toU8Vec())
    expect(transaction.toBuffer().toString('hex')).toEqual(
      result.toBuffer().toString('hex'),
    )
  })

  describe('fromU8Vec', () => {
    test('fromU8Vec', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const result = Transaction.fromU8Vec(transaction.toU8Vec())
      expect(result).toBeInstanceOf(Transaction)
      expect(result.version).toEqual(version)
      expect(result.inputs.length).toEqual(inputs.length)
      expect(result.outputs.length).toEqual(outputs.length)
      expect(result.locktime).toEqual(locktime)
    })
  })

  describe('fromBufferReader', () => {
    test('fromBufferReader', () => {
      const version = 1
      const inputs: TransactionInput[] = [
        new TransactionInput(Buffer.alloc(32), 0, new Script(), 0xffffffff),
      ]
      const outputs: TransactionOutput[] = [
        new TransactionOutput(BigInt(100), new Script()),
      ]
      const locktime = BigInt(0)

      const transaction = new Transaction(version, inputs, outputs, locktime)

      const reader = new BufferReader(transaction.toBuffer())
      const result = Transaction.fromBufferReader(reader)
      expect(result).toBeInstanceOf(Transaction)
      expect(result.version).toEqual(version)
      expect(result.inputs.length).toEqual(inputs.length)
      expect(result.outputs.length).toEqual(outputs.length)
      expect(result.locktime).toEqual(locktime)
    })
  })
})
