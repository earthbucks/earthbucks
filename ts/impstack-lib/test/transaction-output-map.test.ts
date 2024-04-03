import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionOutputMap from '../src/transaction-output-map'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'

describe('TransactionOutputMap', () => {
  let transactionOutputMap: TransactionOutputMap
  let transactionOutput: TransactionOutput
  let txIdHash: Uint8Array
  let outputIndex: number

  beforeEach(() => {
    transactionOutputMap = new TransactionOutputMap()
    transactionOutput = new TransactionOutput(
      BigInt(100),
      Script.fromString(''),
    )
    txIdHash = new Uint8Array([1, 2, 3, 4])
    outputIndex = 0
  })

  test('nameFromOutput', () => {
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    expect(name).toBe('01020304:0')
  })

  test('add', () => {
    transactionOutputMap.add(transactionOutput, txIdHash, outputIndex)
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    expect(transactionOutputMap.map.get(name)).toBe(transactionOutput)
  })

  test('remove', () => {
    transactionOutputMap.add(transactionOutput, txIdHash, outputIndex)
    transactionOutputMap.remove(txIdHash, outputIndex)
    const name = TransactionOutputMap.nameFromOutput(txIdHash, outputIndex)
    expect(transactionOutputMap.map.get(name)).toBeUndefined()
  })

  test('get', () => {
    transactionOutputMap.add(transactionOutput, txIdHash, outputIndex)
    const retrievedOutput = transactionOutputMap.get(txIdHash, outputIndex)
    expect(retrievedOutput).toBe(transactionOutput)
  })
})
