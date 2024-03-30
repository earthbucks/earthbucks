import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import VarInt from './var-int'
import Script from './script'

//valueBn, scriptVi, script
export default class TransactionOutput {
  public value: bigint
  public script: Script

  constructor(
    value: bigint,
    script: Script,
  ) {
    this.value = value
    this.script = script
  }

  static fromUint8Array(buf: Uint8Array): TransactionOutput {
    const reader = new BufferReader(buf)
    const value = reader.readUInt64BEBigInt()
    const scriptArr = reader.read(reader.readUInt8())
    const script = Script.fromUint8Array(scriptArr)
    return new TransactionOutput(value, script)
  }

  toUint8Array(): Uint8Array {
    const writer = new BufferWriter()
    writer.writeUInt64BEBigInt(this.value)
    const scriptBuf = this.script.toUint8Array()
    writer.writeUInt8Array(VarInt.fromNumber(scriptBuf.length).toUint8Array())
    writer.writeUInt8Array(scriptBuf)
    return writer.toUint8Array()
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toUint8Array())
  }
}