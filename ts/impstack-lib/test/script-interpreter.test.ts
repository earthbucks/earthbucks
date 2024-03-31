import { describe, expect, test, beforeEach, it } from '@jest/globals'
import ScriptInterpreter from '../src/script-interpreter'
import Script from '../src/script'
import Transaction from '../src/transaction'
import TransactionInput from '../src/transaction-input'
import TransactionOutput from '../src/transaction-output'
import fs from 'fs'
import path from 'path'

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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
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
      const scriptInterpreter = ScriptInterpreter.fromScript(
        script,
        transaction,
      )
      scriptInterpreter.evalScript()
      expect(scriptInterpreter.returnSuccess).toBe(true)
      expect(scriptInterpreter.returnValue).toBeDefined()
      expect(
        scriptInterpreter.returnValue &&
          Buffer.from(scriptInterpreter.returnValue).toString('hex'),
      ).toEqual('ff')
    })
  })

  describe('test vectors', () => {
    interface TestScript {
      name: string
      script: string
      expected_return_value: string
      expected_success: boolean
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
          const scriptInterpreter = ScriptInterpreter.fromScript(
            script,
            transaction,
          )
          scriptInterpreter.evalScript()
          expect(scriptInterpreter.returnSuccess).toBe(
            testScript.expected_success,
          )
          expect(
            scriptInterpreter.returnValue &&
              Buffer.from(scriptInterpreter.returnValue).toString('hex'),
          ).toBe(testScript.expected_return_value)
        })
      })
    })
  })
})
