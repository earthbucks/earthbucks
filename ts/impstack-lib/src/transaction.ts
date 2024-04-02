import TransactionInput from './transaction-input'
import TransactionOutput from './transaction-output'
import VarInt from './var-int'
import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import { blake3Hash, doubleBlake3Hash } from './blake3'
import { ecdsaSign, ecdsaVerify } from 'secp256k1'
import TransactionSignature from './transaction-signature'

export default class Transaction {
  public version: number
  public inputs: TransactionInput[]
  public outputs: TransactionOutput[]
  public locktime: bigint
  private prevoutsHash?: Uint8Array
  private sequenceHash?: Uint8Array
  private outputsHash?: Uint8Array

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

  hashPrevouts(): Uint8Array {
    const writer = new BufferWriter()
    for (const input of this.inputs) {
      writer.writeU8Vec(input.inputTxId)
      writer.writeUInt32BE(input.inputTxIndex)
    }
    return doubleBlake3Hash(writer.toU8Vec())
  }

  hashSequence(): Uint8Array {
    const writer = new BufferWriter()
    for (const input of this.inputs) {
      writer.writeUInt32LE(input.sequence)
    }
    return doubleBlake3Hash(writer.toU8Vec())
  }

  hashOutputs(): Uint8Array {
    const writer = new BufferWriter()
    for (const output of this.outputs) {
      writer.writeU8Vec(output.toU8Vec())
    }
    return doubleBlake3Hash(writer.toU8Vec())
  }

  sighashPreimage(
    inputIndex: number,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): Uint8Array {
    const SIGHASH_ANYONECANPAY = 0x80
    const SIGHASH_SINGLE = 0x03
    const SIGHASH_NONE = 0x02

    let prevoutsHash = new Uint8Array(32)
    let sequenceHash = new Uint8Array(32)
    let outputsHash = new Uint8Array(32)

    if (!(hashType & SIGHASH_ANYONECANPAY)) {
      this.prevoutsHash = this.prevoutsHash ?? this.hashPrevouts()
      prevoutsHash = this.prevoutsHash
    }

    if (
      !(hashType & SIGHASH_ANYONECANPAY) &&
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      this.sequenceHash = this.sequenceHash ?? this.hashSequence()
      sequenceHash = this.sequenceHash
    }

    if (
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      this.outputsHash = this.outputsHash ?? this.hashOutputs()
      outputsHash = this.outputsHash
    } else if (
      (hashType & 0x1f) === SIGHASH_SINGLE &&
      inputIndex < this.outputs.length
    ) {
      outputsHash = doubleBlake3Hash(this.outputs[inputIndex].toU8Vec())
    }

    const writer = new BufferWriter()
    writer.writeUInt8(this.version)
    writer.writeU8Vec(prevoutsHash)
    writer.writeU8Vec(sequenceHash)
    writer.writeU8Vec(this.inputs[inputIndex].inputTxId)
    writer.writeUInt32BE(this.inputs[inputIndex].inputTxIndex)
    writer.writeVarIntNum(script.length)
    writer.writeU8Vec(script)
    writer.writeUInt64BEBigInt(amount)
    writer.writeUInt32BE(this.inputs[inputIndex].sequence)
    writer.writeU8Vec(outputsHash)
    writer.writeUInt64BEBigInt(this.locktime)
    writer.writeUInt8(hashType)
    return writer.toU8Vec()
  }

  sighash(
    inputIndex: number,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): Uint8Array {
    const preimage = this.sighashPreimage(inputIndex, script, amount, hashType)
    return doubleBlake3Hash(preimage)
  }

  sign(
    inputIndex: number,
    privateKey: Uint8Array,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): TransactionSignature {
    const hash = this.sighash(inputIndex, script, amount, hashType)
    let sigBuf = ecdsaSign(hash, privateKey).signature
    const sig = new TransactionSignature(hashType, sigBuf)
    return sig
  }

  verify(
    inputIndex: number,
    publicKey: Uint8Array,
    sig: TransactionSignature,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): boolean {
    const hash = this.sighash(inputIndex, script, amount, hashType)
    return ecdsaVerify(hash, sig.sigBuf, publicKey)
  }
}
