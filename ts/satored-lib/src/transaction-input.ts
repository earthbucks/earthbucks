import BufferWriter from './buffer-writer'
import BufferReader from './buffer-reader'
import Script from './script'
import VarInt from './var-int'

export default class TransactionInput {
  public inputTxHash: Uint8Array
  public inputTxIndex: number
  public script: Script
  public sequence: number

  constructor(
    inputTxHash: Uint8Array,
    inputTxIndex: number,
    script: Script,
    sequence: number,
  ) {
    this.inputTxHash = inputTxHash
    this.inputTxIndex = inputTxIndex
    this.script = script
    this.sequence = sequence
  }

  static fromUint8Array(buf: Uint8Array): TransactionInput {
    const reader = new BufferReader(buf)
    const inputTxHash = reader.read(32)
    const inputTxIndex = reader.readUInt32LE()
    const script = Script.fromUint8Array(reader.read(reader.readUInt8()))
    const sequence = reader.readUInt32LE()
    return new TransactionInput(inputTxHash, inputTxIndex, script, sequence)
  }

  toUint8Array(): Uint8Array {
    const writer = new BufferWriter()
    writer.writeUint8Array(this.inputTxHash)
    writer.writeUInt32LE(this.inputTxIndex)
    const scriptBuf = this.script.toUint8Array()
    writer.writeUint8Array(VarInt.fromNumber(scriptBuf.length).toUint8Array())
    writer.writeUint8Array(scriptBuf)
    writer.writeUInt32LE(this.sequence)
    return writer.toUint8Array()
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toUint8Array())
  }
}
