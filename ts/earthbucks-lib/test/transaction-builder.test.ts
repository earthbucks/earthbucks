import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionBuilder from '../src/transaction-builder'
import TransactionOutputMap from '../src/transaction-output-map'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import Key from '../src/key'
import PubKeyHash from '../src/pub-key-hash'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'

describe('TransactionBuilder', () => {
  let transactionBuilder: TransactionBuilder
  let txOutMap: TransactionOutputMap
  let pubKeyHashKeyMap: PubKeyHashKeyMap

  beforeEach(() => {
    txOutMap = new TransactionOutputMap()
    pubKeyHashKeyMap = new PubKeyHashKeyMap()
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = Key.fromRandom()
      const pubKeyHash = new PubKeyHash(key.publicKey)
      pubKeyHashKeyMap.add(key, pubKeyHash.pubKeyHash)
      const script = Script.fromPubKeyHashOutput(pubKeyHash.pubKeyHash)
      const output = new TransactionOutput(BigInt(100), script)
      txOutMap.add(output, Buffer.from('00'.repeat(32), 'hex'), i)
    }

    const changeScript = Script.fromString('')
    transactionBuilder = new TransactionBuilder(txOutMap, changeScript)
  })

  test('should build a valid transaction when input is enough to cover the output', () => {
    const key = Key.fromRandom()
    const pubKeyHash = new PubKeyHash(key.publicKey)
    const script = Script.fromPubKeyHashOutput(pubKeyHash.pubKeyHash)
    const output = new TransactionOutput(BigInt(50), script)
    transactionBuilder.addOutput(BigInt(50), Script.fromString(''))

    const transaction = transactionBuilder.build()

    expect(transaction.inputs.length).toBe(1)
    expect(transaction.outputs.length).toBe(2)
    expect(transaction.outputs[0].value).toBe(BigInt(50))
  })

  test('should build an invalid transaction when input is insufficient to cover the output', () => {
    transactionBuilder.addOutput(BigInt(10000), Script.fromString(''))

    const transaction = transactionBuilder.build()

    expect(transaction.inputs.length).toBe(5)
    expect(transaction.outputs.length).toBe(1)
    expect(transactionBuilder.inputAmount).toBe(BigInt(500))
    expect(transaction.outputs[0].value).toBe(BigInt(10000))
  })
})
