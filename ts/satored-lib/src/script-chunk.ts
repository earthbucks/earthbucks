import { OPCODE_TO_NAME, NAME_TO_OPCODE } from './opcode'

export class ScriptChunk {
  opcode: number
  buffer?: Buffer

  constructor(opcode: number = 0, buffer?: Uint8Array) {
    this.opcode = opcode
    this.buffer = buffer ? Buffer.from(buffer.buffer) : undefined
  }

  toString(): string {
    if (this.buffer) {
      return `0x${this.buffer.toString('hex')}`
    } else {
      const name = OPCODE_TO_NAME[this.opcode]
      if (name !== undefined) {
        return name
      } else {
        throw new Error('invalid opcode')
      }
    }
  }

  fromString(str: string): this {
    if (str.startsWith('0x')) {
      this.buffer = Buffer.from(str.slice(2), 'hex')
      const len = this.buffer.length
      const onebytelen = len <= 0xff
      const twobytelen = len <= 0xffff
      const fourbytelen = len <= 0xffffffff
      if (onebytelen) {
        this.opcode = NAME_TO_OPCODE.OP_PUSHDATA1
      } else if (twobytelen) {
        this.opcode = NAME_TO_OPCODE.OP_PUSHDATA2
      } else if (fourbytelen) {
        this.opcode = NAME_TO_OPCODE.OP_PUSHDATA4
      } else {
        throw new Error('too much data')
      }
    } else {
      const opcode = NAME_TO_OPCODE[str]
      console.log(opcode)
      if (opcode !== undefined) {
        this.opcode = opcode
      } else {
        throw new Error('invalid opcode')
      }
      this.buffer = undefined
    }
    return this
  }

  static fromString(str: string): ScriptChunk {
    return new ScriptChunk().fromString(str)
  }
}
