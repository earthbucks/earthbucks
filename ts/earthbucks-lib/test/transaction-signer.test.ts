import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TransactionBuilder from '../src/transaction-builder'
import TransactionOutputMap from '../src/transaction-output-map'
import TransactionOutput from '../src/transaction-output'
import Script from '../src/script'
import Key from '../src/key'
import PubKeyHash from '../src/pub-key-hash'
import PubKeyHashKeyMap from '../src/pub-key-hash-key-map'
import TransactionSigner from '../src/transaction-signer'
import ScriptInterpreter from 'earthbucks-lib/src/script-interpreter'

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

    transactionSigner = new TransactionSigner(
      transaction,
      txOutMap,
      pubKeyHashKeyMap,
    )
    const signed = transactionSigner.sign(0)
    expect(signed).toBe(true)

    const txInput = transaction.inputs[0]
    const txOutput = txOutMap.get(txInput.inputTxId, txInput.inputTxIndex)
    const execScript = txOutput?.script as Script
    const sigBuf = txInput.script.chunks[0].buffer as Uint8Array
    expect(sigBuf?.length).toBe(65)
    const pubKeyBuf = txInput.script.chunks[1].buffer as Uint8Array
    expect(pubKeyBuf?.length).toBe(33)

    const stack = [sigBuf, pubKeyBuf]

    const scriptInterpreter = ScriptInterpreter.fromOutputScriptTransaction(
      execScript,
      transaction,
      0,
      stack,
      100n,
    )

    const result = scriptInterpreter.evalScript()
    expect(result).toBe(true)
  })

  test('should sign two inputs', () => {
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

    const txInput1 = transaction.inputs[0]
    const txOutput1 = txOutMap.get(txInput1.inputTxId, txInput1.inputTxIndex)
    const execScript1 = txOutput1?.script as Script
    const sigBuf1 = txInput1.script.chunks[0].buffer as Uint8Array
    expect(sigBuf1?.length).toBe(65)
    const pubKeyBuf1 = txInput1.script.chunks[1].buffer as Uint8Array
    expect(pubKeyBuf1?.length).toBe(33)

    const stack1 = [sigBuf1, pubKeyBuf1]

    const scriptInterpreter1 = ScriptInterpreter.fromOutputScriptTransaction(
      execScript1,
      transaction,
      0,
      stack1,
      100n,
    )

    const result1 = scriptInterpreter1.evalScript()
    expect(result1).toBe(true)

    const txInput2 = transaction.inputs[1]
    const txOutput2 = txOutMap.get(txInput2.inputTxId, txInput2.inputTxIndex)
    const execScript2 = txOutput2?.script as Script
    const sigBuf2 = txInput2.script.chunks[0].buffer as Uint8Array
    expect(sigBuf2?.length).toBe(65)
    const pubKeyBuf2 = txInput2.script.chunks[1].buffer as Uint8Array
    expect(pubKeyBuf2?.length).toBe(33)

    const stack2 = [sigBuf2, pubKeyBuf2]

    const scriptInterpreter2 = ScriptInterpreter.fromOutputScriptTransaction(
      execScript2,
      transaction,
      1,
      stack2,
      100n,
    )

    const result2 = scriptInterpreter2.evalScript()
    expect(result2).toBe(true)
  })
})
