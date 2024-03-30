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
})