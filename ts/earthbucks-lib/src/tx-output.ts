import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import VarInt from './var-int'
import Script from './script'

export default class TxOutput {
  public value: bigint
  public script: Script

  constructor(value: bigint, script: Script) {
    this.value = value
    this.script = script
  }

  static fromU8Vec(buf: Uint8Array): TxOutput {
    const reader = new BufferReader(buf)
    const value = reader.readUInt64BEBigInt()
    const scriptLen = reader.readVarIntNum()
    const scriptArr = reader.read(scriptLen)
    const script = Script.fromU8Vec(scriptArr)
    return new TxOutput(value, script)
  }

  static fromBufferReader(reader: BufferReader): TxOutput {
    const value = reader.readUInt64BEBigInt()
    const scriptLen = reader.readVarIntNum()
    const scriptArr = reader.read(scriptLen)
    const script = Script.fromU8Vec(scriptArr)
    return new TxOutput(value, script)
  }

  toU8Vec(): Uint8Array {
    const writer = new BufferWriter()
    writer.writeUInt64BEBigInt(this.value)
    const scriptBuf = this.script.toU8Vec()
    writer.writeU8Vec(VarInt.fromNumber(scriptBuf.length).toU8Vec())
    writer.writeU8Vec(scriptBuf)
    return writer.toU8Vec()
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toU8Vec())
  }
}
