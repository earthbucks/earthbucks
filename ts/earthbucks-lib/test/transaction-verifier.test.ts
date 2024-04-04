import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionBuilder from '../src/transaction-builder'
import TransactionOutputMap from '../src/transaction-output-map'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import Key from '../src/key'
import PubKeyHash from '../src/pub-key-hash'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'
import TransactionSigner from '../src/transaction-signer'
import TransactionVerifier from 'earthbucks-lib/src/transaction-verifier'

describe('TransactionVerifier', () => {
  let transactionBuilder: TransactionBuilder
  let transactionSigner: TransactionSigner
  let transactionVerifier: TransactionVerifier
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

  test('should sign and verify a transaction', () => {
    const key = Key.fromRandom()
    const pubKeyHash = new PubKeyHash(key.publicKey)
    const script = Script.fromPubKeyHashOutput(pubKeyHash.pubKeyHash)
    const output = new TransactionOutput(BigInt(50), script)
    transactionBuilder.addOutput(BigInt(50), Script.fromString(''))

    const transaction = transactionBuilder.build()

    expect(transaction.inputs.length).toBe(1)
    expect(transaction.outputs.length).toBe(2)
    expect(transaction.outputs[0].value).toBe(BigInt(50))

    transactionSigner = new TransactionSigner(
      transaction,
      txOutMap,
      pubKeyHashKeyMap,
    )
    const signed = transactionSigner.sign(0)
    expect(signed).toBe(true)

    const transactionVerifier = new TransactionVerifier(transaction, txOutMap)
    const verifiedInput = transactionVerifier.verifyInput(0)
    expect(verifiedInput).toBe(true)

    const verified = transactionVerifier.verify()
    expect(verified).toBe(true)
  })

  test('should sign and verify a transaction with two inputs', () => {
    const key = Key.fromRandom()
    const pubKeyHash = new PubKeyHash(key.publicKey)
    const script = Script.fromPubKeyHashOutput(pubKeyHash.pubKeyHash)
    const output = new TransactionOutput(BigInt(50), script)
    transactionBuilder.addOutput(BigInt(100), Script.fromString(''))
    transactionBuilder.addOutput(BigInt(100), Script.fromString(''))

    const transaction = transactionBuilder.build()

    expect(transaction.inputs.length).toBe(2)
    expect(transaction.outputs.length).toBe(2)
    expect(transaction.outputs[0].value).toBe(BigInt(100))
    expect(transaction.outputs[1].value).toBe(BigInt(100))

    transactionSigner = new TransactionSigner(
      transaction,
      txOutMap,
      pubKeyHashKeyMap,
    )
    const signed1 = transactionSigner.sign(0)
    expect(signed1).toBe(true)
    const signed2 = transactionSigner.sign(1)
    expect(signed2).toBe(true)

    const transactionVerifier = new TransactionVerifier(transaction, txOutMap)
    const verifiedInput1 = transactionVerifier.verifyInput(0)
    expect(verifiedInput1).toBe(true)
    const verifiedInput2 = transactionVerifier.verifyInput(1)
    expect(verifiedInput2).toBe(true)

    const verified = transactionVerifier.verify()
    expect(verified).toBe(true)
  })
})
