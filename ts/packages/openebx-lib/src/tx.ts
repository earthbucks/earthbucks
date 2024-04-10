import TxInput from './tx-input'
import TxOutput from './tx-output'
import VarInt from './var-int'
import BufferReader from './buffer-reader'
import BufferWriter from './buffer-writer'
import { blake3Hash, doubleBlake3Hash } from './blake3'
import { ecdsaSign, ecdsaVerify } from 'secp256k1'
import TxSignature from './tx-signature'
import Script from './script'
import { Buffer } from 'buffer'

export class HashCache {
  public hashPrevouts?: Uint8Array
  public hashSequence?: Uint8Array
  public hashOutputs?: Uint8Array
}

export default class Tx {
  public version: number
  public inputs: TxInput[]
  public outputs: TxOutput[]
  public locktime: bigint

  constructor(
    version: number,
    inputs: TxInput[],
    outputs: TxOutput[],
    locktime: bigint,
  ) {
    this.version = version
    this.inputs = inputs
    this.outputs = outputs
    this.locktime = locktime
  }

  static fromU8Vec(buf: Uint8Array): Tx {
    const reader = new BufferReader(buf)
    const version = reader.readUInt8()
    const numInputs = reader.readVarIntNum()
    const inputs = []
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TxInput.fromBufferReader(reader))
    }
    const numOutputs = reader.readVarIntNum()
    const outputs = []
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TxOutput.fromBufferReader(reader))
    }
    const locktime = reader.readUInt64BEBigInt()
    return new Tx(version, inputs, outputs, BigInt(locktime))
  }

  static fromBufferReader(reader: BufferReader): Tx {
    const version = reader.readUInt8()
    const numInputs = reader.readVarIntNum()
    const inputs = []
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TxInput.fromBufferReader(reader))
    }
    const numOutputs = reader.readVarIntNum()
    const outputs = []
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TxOutput.fromBufferReader(reader))
    }
    const locktime = reader.readUInt64BEBigInt()
    return new Tx(version, inputs, outputs, BigInt(locktime))
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

  toString(): string {
    return this.toBuffer().toString('hex')
  }

  static fromString(hex: string): Tx {
    return Tx.fromU8Vec(Buffer.from(hex, 'hex'))
  }

  static fromCoinbase(
    inputScript: Script,
    outputScript: Script,
    outputAmount: bigint,
  ): Tx {
    const version = 1
    const inputs = [TxInput.fromCoinbase(inputScript)]
    const outputs = [new TxOutput(outputAmount, outputScript)]
    const locktime = BigInt(0)
    return new Tx(version, inputs, outputs, locktime)
  }

  isCoinbase(): boolean {
    return this.inputs.length === 1 && this.inputs[0].isCoinbase()
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
      writer.writeUInt32BE(input.inputTxOutNum)
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
    hashCache: HashCache,
  ): Uint8Array {
    const SIGHASH_ANYONECANPAY = 0x80
    const SIGHASH_SINGLE = 0x03
    const SIGHASH_NONE = 0x02

    let prevoutsHash = new Uint8Array(32)
    let sequenceHash = new Uint8Array(32)
    let outputsHash = new Uint8Array(32)

    if (!(hashType & SIGHASH_ANYONECANPAY)) {
      if (!hashCache.hashPrevouts) {
        hashCache.hashPrevouts = this.hashPrevouts()
      }
      prevoutsHash = hashCache.hashPrevouts
    }

    if (
      !(hashType & SIGHASH_ANYONECANPAY) &&
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashSequence) {
        hashCache.hashSequence = this.hashSequence()
      }
      sequenceHash = hashCache.hashSequence
    }

    if (
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashOutputs) {
        hashCache.hashOutputs = this.hashOutputs()
      }
      outputsHash = hashCache.hashOutputs
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
    writer.writeUInt32BE(this.inputs[inputIndex].inputTxOutNum)
    writer.writeVarIntNum(script.length)
    writer.writeU8Vec(script)
    writer.writeUInt64BEBigInt(amount)
    writer.writeUInt32BE(this.inputs[inputIndex].sequence)
    writer.writeU8Vec(outputsHash)
    writer.writeUInt64BEBigInt(this.locktime)
    writer.writeUInt8(hashType)
    return writer.toU8Vec()
  }

  sighashNoCache(
    inputIndex: number,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): Uint8Array {
    const hashCache = new HashCache()
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    )
    let hash = doubleBlake3Hash(preimage)
    return hash
  }

  sighashWithCache(
    inputIndex: number,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): Uint8Array {
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    )
    let hash = doubleBlake3Hash(preimage)
    return hash
  }

  signNoCache(
    inputIndex: number,
    privateKey: Uint8Array,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
  ): TxSignature {
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType)
    let sigBuf = ecdsaSign(hash, privateKey).signature
    const sig = new TxSignature(hashType, sigBuf)
    return sig
  }

  signWithCache(
    inputIndex: number,
    privateKey: Uint8Array,
    script: Uint8Array,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): TxSignature {
    const hash = this.sighashWithCache(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    )
    let sigBuf = ecdsaSign(hash, privateKey).signature
    const sig = new TxSignature(hashType, sigBuf)
    return sig
  }

  verifyNoCache(
    inputIndex: number,
    publicKey: Uint8Array,
    sig: TxSignature,
    script: Uint8Array,
    amount: bigint,
  ): boolean {
    const hashType = sig.hashType
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType)
    return ecdsaVerify(sig.sigBuf, hash, publicKey)
  }

  verifyWithCache(
    inputIndex: number,
    publicKey: Uint8Array,
    sig: TxSignature,
    script: Uint8Array,
    amount: bigint,
    hashCache: HashCache,
  ): boolean {
    const hashType = sig.hashType
    const hash = this.sighashWithCache(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    )
    return ecdsaVerify(sig.sigBuf, hash, publicKey)
  }
}
