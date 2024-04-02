import { describe, expect, test, beforeEach, it } from '@jest/globals'
import ScriptInterpreter from '../src/script-interpreter'
import Script from '../src/script'
import Transaction from '../src/transaction'
import TransactionInput from '../src/transaction-input'
import TransactionOutput from '../src/transaction-output'
import fs from 'fs'
import path from 'path'
import Key from '../src/key'
import Address from '../src/address'
import TransactionSignature from '../src/transaction-signature'

describe('ScriptInterpreter', () => {
  let transaction: Transaction

  beforeEach(() => {
    transaction = new Transaction(
      1,
      [new TransactionInput(new Uint8Array(), 0, new Script(), 0xffffffff)],
      [new TransactionOutput(BigInt(0), new Script())],
      BigInt(0),
    )
  })

  describe('sanity tests', () => {
    test('0', () => {
      const script = new Script().fromString('0')
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(false)
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('00')
    })

    test('pushdata1', () => {
      const script = new Script().fromString('0xff')
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ff')
    })

    test('PUSHDATA1', () => {
      const script = new Script().fromString('0xffff')
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ffff')
    })

    test('PUSHDATA2', () => {
      const script = new Script().fromString('0x' + 'ff'.repeat(256))
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ff'.repeat(256))
    })

    test('PUSHDATA4', () => {
      const script = new Script().fromString('0x' + 'ff'.repeat(65536))
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ff'.repeat(65536))
    })

    test('1NEGATE', () => {
      const script = new Script().fromString('1NEGATE')
      const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
        script,
        transaction,
        0,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ff')
    })

    test('CHECKSIG', () => {
      const outputPrivKeyHex =
        'd9486fac4a1de03ca8c562291182e58f2f3e42a82eaf3152ccf744b3a8b3b725'
      const outputPrivKeyBuf = Buffer.from(outputPrivKeyHex, 'hex')
      const outputPrivKeyU8Vec = new Uint8Array(outputPrivKeyBuf)
      const outputKey = new Key(outputPrivKeyU8Vec)
      const outputPubKey = outputKey.publicKey
      expect(Buffer.from(outputPubKey).toString('hex')).toEqual(
        '0377b8ba0a276329096d51275a8ab13809b4cd7af856c084d60784ed8e4133d987',
      )
      const outputAddress = new Address(outputPubKey)
      const outputScript = Script.fromPubKeyHashOutput(outputAddress.address)
      const outputAmount = BigInt(100)
      const outputTxId = Buffer.from('00'.repeat(32), 'hex')
      const outputTxIndex = 0

      const transaction = new Transaction(
        1,
        [
          new TransactionInput(
            outputTxId,
            outputTxIndex,
            new Script(),
            0xffffffff,
          ),
        ],
        [new TransactionOutput(outputAmount, outputScript)],
        BigInt(0),
      )

      const sig = transaction.sign(
        0,
        outputPrivKeyU8Vec,
        outputScript.toU8Vec(),
        outputAmount,
        TransactionSignature.SIGHASH_ALL,
      )

      const stack = [sig.toU8Vec(), outputPubKey]

      const scriptInterpreter = ScriptInterpreter.fromOutputScriptTransaction(
        outputScript,
        transaction,
        0,
        stack,
        outputAmount,
      )

      const result = scriptInterpreter.evalScript()
      expect(result).toBe(true)
    })
  })

  describe('test vectors', () => {
    interface TestScript {
      name: string
      script: string
      expected_return_value: string
      expected_success: boolean
      expected_error: string
    }

    describe('script interpreter scripts', () => {
      const filePath = path.resolve(
        __dirname,
        '../../../json/script_interpreter.json',
      )
      const jsonString = fs.readFileSync(filePath, 'utf-8')
      const testScripts: TestScript[] = JSON.parse(jsonString).scripts
      let transaction: Transaction

      beforeEach(() => {
        transaction = new Transaction(
          1,
          [new TransactionInput(new Uint8Array(), 0, new Script(), 0xffffffff)],
          [new TransactionOutput(BigInt(0), new Script())],
          BigInt(0),
        )
      })

      testScripts.forEach((testScript) => {
        test(testScript.name, () => {
          const script = Script.fromString(testScript.script)
          const scriptInterpreter = ScriptInterpreter.fromScriptTransaction(
            script,
            transaction,
            0,
          )
          scriptInterpreter.evalScript()

          expect(scriptInterpreter.errStr).toEqual(testScript.expected_error)
          expect(
            scriptInterpreter.returnValue &&
              Buffer.from(scriptInterpreter.returnValue).toString('hex'),
          ).toBe(testScript.expected_return_value)
          expect(scriptInterpreter.returnSuccess).toBe(
            testScript.expected_success,
          )
        })
      })
    })
  })
})
