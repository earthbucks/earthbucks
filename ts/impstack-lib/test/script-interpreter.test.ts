import { describe, expect, test, beforeEach, it } from '@jest/globals'
import ScriptInterpreter from '../src/script-interpreter'
import Script from '../src/script'
import Transaction from '../src/transaction'
import TransactionInput from '../src/transaction-input'
import TransactionOutput from '../src/transaction-output'

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
})
