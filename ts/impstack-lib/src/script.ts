import { OP } from './opcode'
import ScriptChunk from './script-chunk'
import BufferReader from './buffer-reader'

export default class Script {
  chunks: ScriptChunk[] = []

  constructor(chunks: ScriptChunk[] = []) {
    this.chunks = chunks
  }

  fromString(str: string): this {
    if (str === '') {
      return this
    }
    this.chunks = str.split(' ').map(ScriptChunk.fromString)
    return this
  }

  static fromString(str: string): Script {
    return new Script().fromString(str)
  }

  toString(): string {
    return this.chunks.map((chunk) => chunk.toString()).join(' ')
  }

  toU8Vec(): Uint8Array {
    const bufArray = this.chunks.map((chunk) => chunk.toU8Vec())
    const buf = Buffer.concat(bufArray)
    return new Uint8Array(buf)
  }

  fromU8Vec(arr: Uint8Array): this {
    const reader = new BufferReader(arr)
    while (!reader.eof()) {
      const chunk = new ScriptChunk()
      chunk.opcode = reader.readUInt8()
      if (chunk.opcode <= OP.PUSHDATA4) {
        let len = chunk.opcode
        if (len === OP.PUSHDATA1) {
          len = reader.readUInt8()
        } else if (len === OP.PUSHDATA2) {
          len = reader.readUInt16LE()
        } else if (len === OP.PUSHDATA4) {
          len = reader.readUInt32LE()
        }
        chunk.buffer = Buffer.from(reader.read(len))
        if (chunk.buffer.length !== len) {
          throw new Error('invalid buffer length')
        }
      }
      this.chunks.push(chunk)
    }
    return this
  }

  static fromU8Vec(arr: Uint8Array): Script {
    return new Script().fromU8Vec(arr)
  }

  static fromPubKeyHashOutput(pubKeyHash: Uint8Array): Script {
    return new Script([
      new ScriptChunk(OP.DUP),
      new ScriptChunk(OP.DOUBLEBLAKE3),
      ScriptChunk.fromData(pubKeyHash),
      new ScriptChunk(OP.EQUALVERIFY),
      new ScriptChunk(OP.CHECKSIG),
    ])
  }

  static fromPubKeyHashInput(sig: Uint8Array, pubKey: Uint8Array): Script {
    return new Script([ScriptChunk.fromData(sig), ScriptChunk.fromData(pubKey)])
  }
}
