import TransactionInput from './transaction-input'
import TransactionOutput from './transaction-output'
import VarInt from './var-int'
import BufferReader from './buffer-reader'

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
    const version = reader.readUInt32LE()
    const numInputs = reader.readVarIntNum()
    const inputs = []
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TransactionInput.fromU8Vec(reader))
    }
    const numOutputs = reader.readVarIntNum()
    const outputs = []
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TransactionOutput.fromU8Vec(reader))
    }
    const locktime = reader.readUInt32LE()
    return new Transaction(version, inputs, outputs, BigInt(locktime))
  }
}
