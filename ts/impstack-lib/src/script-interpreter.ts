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

  evalScript(): boolean {
    while (this.pc < this.script.chunks.length) {
      const chunk = this.script.chunks[this.pc]
      const opcode = chunk.opcode
      if (opcode === NAME_TO_OPCODE.OP_0 || opcode === NAME_TO_OPCODE.OP_PUSHDATA1 || opcode === NAME_TO_OPCODE.OP_PUSHDATA2 || opcode === NAME_TO_OPCODE.OP_PUSHDATA4) {
        if (chunk.buffer) {
          this.stack.push(chunk.buffer)
        } else {
          this.errStr = 'invalid opcode'
          return false
        }
      } else if (opcode === NAME_TO_OPCODE.OP_1NEGATE) {
        this.stack.push(Buffer.from([0x81]))
      }
      this.pc++
    }
    return true
  }
}
