import TransactionInput from './transaction-input'
import TransactionOutput from './transaction-output'
import VarInt from './var-int'
import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import { blake3Hash, doubleBlake3Hash } from './blake3'

export default class Transaction {
  public version: number
  public inputs: TransactionInput[]
  public outputs: TransactionOutput[]
  public locktime: bigint

  constructor(
    version: number,
    inputs: TransactionInput[],
    outputs: TransactionOutput[],
    locktime: bigint,
  ) {
    this.version = version
    this.inputs = inputs
    this.outputs = outputs
    this.locktime = locktime
  }

  static fromU8Vec(buf: Uint8Array): Transaction {
    const reader = new BufferReader(buf)
    const version = reader.readUInt8()
    const numInputs = reader.readVarIntNum()
    const inputs = []
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TransactionInput.fromBufferReader(reader))
    }
    const numOutputs = reader.readVarIntNum()
    const outputs = []
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TransactionOutput.fromBufferReader(reader))
    }
    const locktime = reader.readUInt64BEBigInt()
    return new Transaction(version, inputs, outputs, BigInt(locktime))
  }

  static fromBufferReader(reader: BufferReader): Transaction {
    const version = reader.readUInt8()
    const numInputs = reader.readVarIntNum()
    const inputs = []
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TransactionInput.fromBufferReader(reader))
    }
    const numOutputs = reader.readVarIntNum()
    const outputs = []
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TransactionOutput.fromBufferReader(reader))
    }
    const locktime = reader.readUInt64BEBigInt()
    return new Transaction(version, inputs, outputs, BigInt(locktime))
  }

  toU8Vec(): Uint8Array {
    const writer = new BufferWriter()
    writer.writeUInt8(this.version)
    writer.writeU8Vec(VarInt.fromNumber(this.inputs.length).toU8Vec())
    for (const input of this.inputs) {
      writer.writeU8Vec(input.toU8Vec())
    }
    writer.writeU8Vec(VarInt.fromNumber(this.outputs.length).toU8Vec())
    for (const output of this.outputs) {
      writer.writeU8Vec(output.toU8Vec())
    }
    writer.writeUInt64BEBigInt(this.locktime)
    return writer.toU8Vec()
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toU8Vec())
  }

  blake3Hash(): Uint8Array {
    return blake3Hash(this.toU8Vec())
  }

  id(): Uint8Array {
    return doubleBlake3Hash(this.toU8Vec())
  }
}
