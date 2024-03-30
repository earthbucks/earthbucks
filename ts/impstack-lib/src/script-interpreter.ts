import { OPCODE_TO_NAME, NAME_TO_OPCODE } from './opcode'
import Script from './script'
import Transaction from './transaction'
import TransactionInput from './transaction-input'

export default class ScriptInterpreter {
  public script: Script
  public transaction: Transaction
  public inputIndex: number
  public stack: Uint8Array[]
  public altStack: Uint8Array[]
  public pc: number
  public pBeginCodeHash: number
  public nOpCount: number
  public ifStack: boolean[]
  public errStr: string
  public value: bigint

  constructor(
    script: Script,
    transaction: Transaction,
    inputIndex: number,
    stack: Uint8Array[],
    altStack: Uint8Array[],
    pc: number,
    pBeginCodeHash: number,
    nOpCount: number,
    ifStack: boolean[],
    errStr: string,
    value: bigint,
  ) {
    this.script = script
    this.transaction = transaction
    this.inputIndex = inputIndex
    this.stack = stack
    this.altStack = altStack
    this.pc = pc
    this.pBeginCodeHash = pBeginCodeHash
    this.nOpCount = nOpCount
    this.ifStack = ifStack
    this.errStr = errStr
    this.value = value
  }

  fromScript(
    script: Script,
    transaction: Transaction,
    inputIndex: number,
  ): ScriptInterpreter {
    return new ScriptInterpreter(
      script,
      transaction,
      inputIndex,
      [],
      [],
      0,
      0,
      0,
      [],
      '',
      BigInt(0),
    )
  }
}
