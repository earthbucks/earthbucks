import { describe, expect, test, beforeEach, it } from '@jest/globals'
import TxBuilder from '../src/tx-builder'
import TxOutputMap from '../src/tx-output-map'
import TxOutput from '../src/tx-output'
import Script from '../src/script'
import Key from '../src/key'
import Address from '../src/address'
import AddressKeyMap from '../src/address-key-map'
import TxSigner from '../src/tx-signer'
import TxVerifier from 'earthbucks-lib/src/tx-verifier'

describe('TxVerifier', () => {
  let txBuilder: TxBuilder
  let txSigner: TxSigner
  let txOutMap: TxOutputMap
  let addressKeyMap: AddressKeyMap

  beforeEach(() => {
    txOutMap = new TxOutputMap()
    addressKeyMap = new AddressKeyMap()
    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for (let i = 0; i < 5; i++) {
      const key = Key.fromRandom()
      const address = new Address(key.publicKey)
      addressKeyMap.add(key, address.address)
      const script = Script.fromAddressOutput(address.address)
      const output = new TxOutput(BigInt(100), script)
      txOutMap.add(output, Buffer.from('00'.repeat(32), 'hex'), i)
    }

    const changeScript = Script.fromString('')
    txBuilder = new TxBuilder(txOutMap, changeScript)
  })

  test('should sign and verify a tx', () => {
    const key = Key.fromRandom()
    const address = new Address(key.publicKey)
    const script = Script.fromAddressOutput(address.address)
    txBuilder.addOutput(BigInt(50), Script.fromString(''))

    const tx = txBuilder.build()

    expect(tx.inputs.length).toBe(1)
    expect(tx.outputs.length).toBe(2)
    expect(tx.outputs[0].value).toBe(BigInt(50))

    txSigner = new TxSigner(tx, txOutMap, addressKeyMap)
    const signed = txSigner.sign(0)
    expect(signed).toBe(true)

    const txVerifier = new TxVerifier(tx, txOutMap)
    const verifiedInput = txVerifier.verifyInputScript(0)
    expect(verifiedInput).toBe(true)

    const verifiedScripts = txVerifier.verifyScripts()
    expect(verifiedScripts).toBe(true)

    const verifiedOutputValues = txVerifier.verifyOutputValues()
    expect(verifiedOutputValues).toBe(true)

    const verified = txVerifier.verify()
    expect(verified).toBe(true)
  })

  test('should sign and verify a tx with two inputs', () => {
    const key = Key.fromRandom()
    const address = new Address(key.publicKey)
    const script = Script.fromAddressOutput(address.address)
    txBuilder.addOutput(BigInt(100), Script.fromString(''))
    txBuilder.addOutput(BigInt(100), Script.fromString(''))

    const tx = txBuilder.build()

    expect(tx.inputs.length).toBe(2)
    expect(tx.outputs.length).toBe(2)
    expect(tx.outputs[0].value).toBe(BigInt(100))
    expect(tx.outputs[1].value).toBe(BigInt(100))

    txSigner = new TxSigner(tx, txOutMap, addressKeyMap)
    const signed1 = txSigner.sign(0)
    expect(signed1).toBe(true)
    const signed2 = txSigner.sign(1)
    expect(signed2).toBe(true)

    const txVerifier = new TxVerifier(tx, txOutMap)
    const verifiedInput1 = txVerifier.verifyInputScript(0)
    expect(verifiedInput1).toBe(true)
    const verifiedInput2 = txVerifier.verifyInputScript(1)
    expect(verifiedInput2).toBe(true)

    const verifiedScripts = txVerifier.verifyScripts()
    expect(verifiedScripts).toBe(true)

    const verifiedOutputValues = txVerifier.verifyOutputValues()
    expect(verifiedOutputValues).toBe(true)

    const verified = txVerifier.verify()
    expect(verified).toBe(true)
  })
})
