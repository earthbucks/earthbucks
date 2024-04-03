import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionBuilder from '../src/transaction-builder'
import TransactionOutputMap from '../src/transaction-output-map'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import Key from '../src/key'
import PubKeyHash from '../src/pub-key-hash'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'
import TransactionSigner from '../src/transaction-signer'
import ScriptInterpreter from 'impstack-lib/src/script-interpreter'

describe('TransactionSigner', () => {
  let transactionBuilder: TransactionBuilder
  let transactionSigner: TransactionSigner
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

  test('should sign a transaction', () => {
    const key = Key.fromRandom()
    const pubKeyHash = new PubKeyHash(key.publicKey)
    const script = Script.fromPubKeyHashOutput(pubKeyHash.pubKeyHash)
    const output = new TransactionOutput(BigInt(50), script)
    transactionBuilder.addOutput(BigInt(50), Script.fromString(''))

    const transaction = transactionBuilder.build()

    expect(transaction.inputs.length).toBe(1)
    expect(transaction.outputs.length).toBe(2)
    expect(transaction.outputs[0].value).toBe(BigInt(50))

    transactionSigner = new TransactionSigner(transaction, txOutMap, pubKeyHashKeyMap)
    const signed = transactionSigner.sign(0)
    expect(signed).toBe(true)

    const txInput = transaction.inputs[0]
    const sigBuf = txInput.script.chunks[0].buffer as Uint8Array
    expect(sigBuf?.length).toBe(65)
    const pubKeyBuf = txInput.script.chunks[1].buffer as Uint8Array
    expect(pubKeyBuf?.length).toBe(33)

    // const stack = [sigBuf, pubKeyBuf]

    // const scriptInterpreter = ScriptInterpreter.fromOutputScriptTransaction(script, transaction, 0, stack, 100n)

    // const result = scriptInterpreter.evalScript()
    // expect(result).toBe(true)
  })
})
