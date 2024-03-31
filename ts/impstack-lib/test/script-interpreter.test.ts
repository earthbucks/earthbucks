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
    test('pushdata1', () => {
      const script = new Script().fromString('0xff')
      const scriptInterpreter = new ScriptInterpreter(
        script,
        transaction,
        [],
        [],
        0,
        0,
        0,
        [],
        undefined,
        undefined,
        '',
        BigInt(0),
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
