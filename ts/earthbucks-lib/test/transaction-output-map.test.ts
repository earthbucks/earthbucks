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

  test('values method should return all TransactionOutput values', () => {
    const transactionOutputMap = new TransactionOutputMap()
    const transactionOutput1 = transactionOutput
    const transactionOutput2 = transactionOutput
    transactionOutputMap.add(transactionOutput1, txIdHash, 0)
    transactionOutputMap.add(transactionOutput2, txIdHash, 1)

    const values = Array.from(transactionOutputMap.values())

    expect(values.length).toBe(2)
    expect(values).toContain(transactionOutput1)
    expect(values).toContain(transactionOutput2)
  })
})
