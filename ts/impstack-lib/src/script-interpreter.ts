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
      let ifExec = !this.ifStack.includes(false)

      if (
        ifExec ||
        opcode == NAME_TO_OPCODE.IF ||
        opcode == NAME_TO_OPCODE.NOTIF ||
        opcode == NAME_TO_OPCODE.ELSE ||
        opcode == NAME_TO_OPCODE.ENDIF
      ) {
        if (opcode === NAME_TO_OPCODE.IF) {
          let ifValue = false
          if (ifExec) {
            if (this.stack.length < 1) {
              this.errStr = 'unbalanced conditional'
              return false
            }
            let buf = this.stack.pop() || new Uint8Array()
            ifValue = ScriptInterpreter.castToBool(buf)
          }
          this.ifStack.push(ifValue)
        } else if (opcode === NAME_TO_OPCODE.NOTIF) {
          let ifValue = false
          if (ifExec) {
            if (this.stack.length < 1) {
              this.errStr = 'unbalanced conditional'
              return false
            }
            let buf = this.stack.pop() || new Uint8Array()
            ifValue = ScriptInterpreter.castToBool(buf)
            ifValue = !ifValue
          }
          this.ifStack.push(ifValue)
        } else if (opcode === NAME_TO_OPCODE.ELSE) {
          if (this.ifStack.length === 0) {
            this.errStr = 'unbalanced conditional'
            return false
          }
          this.ifStack[this.ifStack.length - 1] =
            !this.ifStack[this.ifStack.length - 1]
        } else if (opcode === NAME_TO_OPCODE.ENDIF) {
          if (this.ifStack.length === 0) {
            this.errStr = 'unbalanced conditional'
            return false
          }
          this.ifStack.pop()
        } else if (opcode === NAME_TO_OPCODE['0']) {
          this.stack.push(new Uint8Array([0]))
        } else if (
          opcode === NAME_TO_OPCODE.PUSHDATA1 ||
          opcode === NAME_TO_OPCODE.PUSHDATA2 ||
          opcode === NAME_TO_OPCODE.PUSHDATA4
        ) {
          if (chunk.buffer) {
            this.stack.push(new Uint8Array(chunk.buffer))
          } else {
            this.errStr = 'invalid pushdata'
          }
        } else if (opcode === NAME_TO_OPCODE['1NEGATE']) {
          const scriptNum = new ScriptNum(BigInt(-1))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['1']) {
          const scriptNum = new ScriptNum(BigInt(1))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['2']) {
          const scriptNum = new ScriptNum(BigInt(2))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['3']) {
          const scriptNum = new ScriptNum(BigInt(3))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['4']) {
          const scriptNum = new ScriptNum(BigInt(4))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['5']) {
          const scriptNum = new ScriptNum(BigInt(5))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['6']) {
          const scriptNum = new ScriptNum(BigInt(6))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['7']) {
          const scriptNum = new ScriptNum(BigInt(7))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['8']) {
          const scriptNum = new ScriptNum(BigInt(8))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['9']) {
          const scriptNum = new ScriptNum(BigInt(9))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['10']) {
          const scriptNum = new ScriptNum(BigInt(10))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['11']) {
          const scriptNum = new ScriptNum(BigInt(11))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['12']) {
          const scriptNum = new ScriptNum(BigInt(12))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['13']) {
          const scriptNum = new ScriptNum(BigInt(13))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['14']) {
          const scriptNum = new ScriptNum(BigInt(14))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['15']) {
          const scriptNum = new ScriptNum(BigInt(15))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['16']) {
          const scriptNum = new ScriptNum(BigInt(16))
          this.stack.push(scriptNum.toU8Vec())
        } else if (opcode === NAME_TO_OPCODE['IF']) {
        } else {
          this.errStr = 'invalid opcode'
        }
      }

      if (this.errStr) {
        this.returnValue = this.stack[this.stack.length - 1]
        this.returnSuccess = false
        return this.returnSuccess
      }
      this.pc++
    }
    this.returnValue = this.stack[this.stack.length - 1] || new Uint8Array()
    this.returnSuccess = ScriptInterpreter.castToBool(this.returnValue)
    return this.returnSuccess
  }
}
