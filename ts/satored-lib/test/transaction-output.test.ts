import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import BufferReader from '../src/buffer-reader'

describe('TransactionOutput', () => {
  describe('fromBufferReader', () => {
    test('fromBufferReader', () => {
      const value = BigInt(100)
      const script = new Script()
      const transactionOutput = new TransactionOutput(value, script)

      const reader = new BufferReader(transactionOutput.toBuffer())
      const result = TransactionOutput.fromBufferReader(reader)
      expect(result).toBeInstanceOf(TransactionOutput)
      expect(result.value).toEqual(value)
      expect(result.script.toString()).toEqual(script.toString())
    })
  })

  describe('fromU8Vec and toU8Vec', () => {
    test('should create a TransactionOutput from a Uint8Array', () => {
      const value = BigInt(100)
      const script = Script.fromString('HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL')
      const transactionOutput = new TransactionOutput(value, script)
      const result = TransactionOutput.fromU8Vec(transactionOutput.toU8Vec())
      expect(transactionOutput.toBuffer().toString('hex')).toEqual(
        result.toBuffer().toString('hex'),
      )
    })

    test('big push data', () => {
      const data = '0x' + '00'.repeat(0xffff)
      const value = BigInt(100)
      const script = Script.fromString(`${data} HASH160`)
      const transactionOutput = new TransactionOutput(value, script)
      const result = TransactionOutput.fromU8Vec(transactionOutput.toU8Vec())
      expect(transactionOutput.toBuffer().toString('hex')).toEqual(
        result.toBuffer().toString('hex'),
      )
    })
  })
})
