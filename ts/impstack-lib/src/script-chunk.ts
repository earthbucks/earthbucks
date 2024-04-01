import { OPCODE_TO_NAME, OP, OpcodeName } from './opcode'
import BufferWriter from './buffer-writer'

export default class ScriptChunk {
  opcode: number
  buffer?: Buffer

  constructor(opcode: number = 0, arr?: Uint8Array) {
    this.opcode = opcode
    this.buffer = arr ? Buffer.from(arr.buffer) : undefined
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
        this.opcode = OP.PUSHDATA1
      } else if (twobytelen) {
        this.opcode = OP.PUSHDATA2
      } else if (fourbytelen) {
        this.opcode = OP.PUSHDATA4
      } else {
        throw new Error('too much data')
      }
    } else {
      function isOpcodeName(str: string): str is OpcodeName {
        return OP.hasOwnProperty(str)
      }
      if (isOpcodeName(str)) {
        const opcode = OP[str]
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

  toU8Vec(): Uint8Array {
    const opcode = this.opcode
    if (opcode === OP.PUSHDATA1 && this.buffer) {
      const buffer = Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt8(this.buffer.length).toBuffer(),
        this.buffer,
      ])
      return new Uint8Array(buffer)
    } else if (opcode === OP.PUSHDATA2 && this.buffer) {
      const buffer = Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt16BE(this.buffer.length).toBuffer(),
        this.buffer,
      ])
      return new Uint8Array(buffer)
    } else if (opcode === OP.PUSHDATA4 && this.buffer) {
      const buffer = Buffer.concat([
        Buffer.from([opcode]),
        new BufferWriter().writeUInt32BE(this.buffer.length).toBuffer(),
        this.buffer,
      ])
      return new Uint8Array(buffer)
    }
    return new Uint8Array([opcode])
  }

  fromU8Vec(arr: Uint8Array): this {
    const buf = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
    const opcode = arr[0]
    if (opcode === OP.PUSHDATA1) {
      const len = arr[1]
      this.opcode = opcode
      this.buffer = Buffer.from(arr.buffer, arr.byteOffset + 2, len)
    } else if (opcode === OP.PUSHDATA2) {
      const len = buf.readUInt16BE(1)
      this.opcode = opcode
      this.buffer = Buffer.from(arr.buffer, arr.byteOffset + 3, len)
    } else if (opcode === OP.PUSHDATA4) {
      const len = buf.readUInt32BE(1)
      this.opcode = opcode
      this.buffer = Buffer.from(arr.buffer, arr.byteOffset + 5, len)
    } else {
      this.opcode = opcode
      this.buffer = undefined
    }
    return this
  }

  static fromU8Vec(arr: Uint8Array): ScriptChunk {
    return new ScriptChunk().fromU8Vec(arr)
  }
}
