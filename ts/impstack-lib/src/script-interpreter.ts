import { OPCODE_TO_NAME, NAME_TO_OPCODE } from './opcode'
import Script from './script'
import Transaction from './transaction'
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
  public returnValue?: Uint8Array
  public returnSuccess?: boolean
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
    returnValue: Uint8Array | undefined,
    returnSuccess: boolean | undefined,
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
    this.returnValue = returnValue
    this.returnSuccess = returnSuccess
    this.errStr = errStr
    this.value = value
  }

  static fromScript(
    script: Script,
    transaction: Transaction,
  ): ScriptInterpreter {
    return new ScriptInterpreter(
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
  }

  static castToBool(buf: Uint8Array): boolean {
    return Buffer.compare(buf, Buffer.alloc(buf.length)) !== 0
  }

  evalScript(): boolean {
    while (this.pc < this.script.chunks.length) {
      const chunk = this.script.chunks[this.pc]
      const opcode = chunk.opcode

      if (opcode === NAME_TO_OPCODE['0']) {
        this.stack.push(new Uint8Array([0]))
      } else if (
        opcode === NAME_TO_OPCODE.PUSHDATA1 ||
        opcode === NAME_TO_OPCODE.PUSHDATA2 ||
        opcode === NAME_TO_OPCODE.PUSHDATA4
      ) {
        if (chunk.buffer) {
          this.stack.push(chunk.buffer)
        } else {
          this.errStr = 'invalid pushdata'
        }
      } else if (opcode === NAME_TO_OPCODE['1NEGATE']) {
        const scriptNum = new ScriptNum(BigInt(-1))
        this.stack.push(scriptNum.toU8Vec())
      }

      this.pc++
      if (this.errStr) {
        this.returnValue = this.stack[this.stack.length - 1]
        this.returnSuccess = false
        return this.returnSuccess
      }
    }
    this.returnValue = this.stack[this.stack.length - 1]
    this.returnSuccess = ScriptInterpreter.castToBool(this.returnValue)
    return this.returnSuccess
  }
}
