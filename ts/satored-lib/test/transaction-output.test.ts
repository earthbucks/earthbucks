import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionOutput from '../src/transaction-output'
import Script from 'satored-lib/src/script'

describe('TransactionOutput', () => {
  describe('fromUint8Array and toUint8Array', () => {
    test('should create a TransactionOutput from a Uint8Array', () => {
      const value = BigInt(100)
      const script = Script.fromString('HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL')
      const transactionOutput = new TransactionOutput(value, script)
      const result = TransactionOutput.fromUint8Array(transactionOutput.toUint8Array())
      expect (transactionOutput.toBuffer().toString('hex')).toEqual(result.toBuffer().toString('hex'))
    })
  })
})