import { OPCODE_TO_NAME, NAME_TO_OPCODE } from './opcode'
import Script from './script'
import Transaction from './transaction'
import TransactionInput from './transaction-input'
import ScriptNum from './script-num'

export default class ScriptInterpreter {
  public script: Script
  public transaction: Transaction
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
    this.stack = stack
    this.altStack = altStack
    this.pc = pc
    this.pBeginCodeHash = pBeginCodeHash
    this.nOpCount = nOpCount
    this.ifStack = ifStack
    this.errStr = errStr
    this.value = value
  }

  fromScript(script: Script, transaction: Transaction): ScriptInterpreter {
    return new ScriptInterpreter(
      script,
      transaction,
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

  static castToBool(buf: Uint8Array): boolean {
    return Buffer.compare(buf, Buffer.alloc(buf.length)) !== 0
  }

  evalScript(): boolean {
    while (this.pc < this.script.chunks.length) {
      const chunk = this.script.chunks[this.pc]
      const opcode = chunk.opcode
      if (opcode === NAME_TO_OPCODE.OP_0) {
        this.stack.push(new Uint8Array([0]))
      } else if (
        opcode === NAME_TO_OPCODE.OP_PUSHDATA1 ||
        opcode === NAME_TO_OPCODE.OP_PUSHDATA2 ||
        opcode === NAME_TO_OPCODE.OP_PUSHDATA4
      ) {
        if (chunk.buffer) {
          this.stack.push(chunk.buffer)
        } else {
          this.errStr = 'invalid pushdata'
          return false
        }
      } else if (opcode === NAME_TO_OPCODE.OP_1NEGATE) {
        const n = BigInt(-1)
        this.stack.push(Buffer.from(n.toString(16), 'hex'))
      }
      this.pc++
    }
    return true
  }
}
