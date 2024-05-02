import TxInput from "./tx-input";
import TxOutput from "./tx-output";
import VarInt from "./var-int";
import BufferReader from "./buffer-reader";
import BufferWriter from "./buffer-writer";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import TxSignature from "./tx-signature";
import Script from "./script";
import { Buffer } from "buffer";

export class HashCache {
  public hashPrevouts?: Buffer;
  public hashSequence?: Buffer;
  public hashOutputs?: Buffer;
}

export default class Tx {
  public version: number;
  public inputs: TxInput[];
  public outputs: TxOutput[];
  public lockNum: bigint;

  constructor(
    version: number,
    inputs: TxInput[],
    outputs: TxOutput[],
    lockNum: bigint,
  ) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.lockNum = lockNum;
  }

  static fromU8Vec(buf: Buffer): Tx {
    const reader = new BufferReader(buf);
    const version = reader.readUInt8();
    const numInputs = reader.readVarIntNum();
    const inputs = [];
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TxInput.fromBufferReader(reader));
    }
    const numOutputs = reader.readVarIntNum();
    const outputs = [];
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TxOutput.fromBufferReader(reader));
    }
    const lockNum = reader.readUInt64BEBigInt();
    return new Tx(version, inputs, outputs, BigInt(lockNum));
  }

  static fromBufferReader(reader: BufferReader): Tx {
    const version = reader.readUInt8();
    const numInputs = reader.readVarIntNum();
    const inputs = [];
    for (let i = 0; i < numInputs; i++) {
      inputs.push(TxInput.fromBufferReader(reader));
    }
    const numOutputs = reader.readVarIntNum();
    const outputs = [];
    for (let i = 0; i < numOutputs; i++) {
      outputs.push(TxOutput.fromBufferReader(reader));
    }
    const lockNum = reader.readUInt64BEBigInt();
    return new Tx(version, inputs, outputs, BigInt(lockNum));
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.version);
    writer.writeBuffer(VarInt.fromNumber(this.inputs.length).toBuffer());
    for (const input of this.inputs) {
      writer.writeBuffer(input.toBuffer());
    }
    writer.writeBuffer(VarInt.fromNumber(this.outputs.length).toBuffer());
    for (const output of this.outputs) {
      writer.writeBuffer(output.toBuffer());
    }
    writer.writeUInt64BEBigInt(this.lockNum);
    return writer.toBuffer();
  }

  toString(): string {
    return this.toBuffer().toString("hex");
  }

  static fromString(hex: string): Tx {
    return Tx.fromU8Vec(Buffer.from(hex, "hex"));
  }

  static fromCoinbase(
    inputScript: Script,
    outputScript: Script,
    outputAmount: bigint,
  ): Tx {
    const version = 1;
    const inputs = [TxInput.fromCoinbase(inputScript)];
    const outputs = [new TxOutput(outputAmount, outputScript)];
    const lockNum = BigInt(0);
    return new Tx(version, inputs, outputs, lockNum);
  }

  isCoinbase(): boolean {
    return this.inputs.length === 1 && this.inputs[0].isCoinbase();
  }

  blake3Hash(): Buffer {
    return blake3Hash(this.toBuffer());
  }

  id(): Buffer {
    return doubleBlake3Hash(this.toBuffer());
  }

  hashPrevouts(): Buffer {
    const writer = new BufferWriter();
    for (const input of this.inputs) {
      writer.writeBuffer(input.inputTxId);
      writer.writeUInt32BE(input.inputTxNOut);
    }
    return doubleBlake3Hash(writer.toBuffer());
  }

  hashSequence(): Buffer {
    const writer = new BufferWriter();
    for (const input of this.inputs) {
      writer.writeUInt32LE(input.sequence);
    }
    return doubleBlake3Hash(writer.toBuffer());
  }

  hashOutputs(): Buffer {
    const writer = new BufferWriter();
    for (const output of this.outputs) {
      writer.writeBuffer(output.toBuffer());
    }
    return doubleBlake3Hash(writer.toBuffer());
  }

  sighashPreimage(
    inputIndex: number,
    script: Buffer,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): Buffer {
    const SIGHASH_ANYONECANPAY = 0x80;
    const SIGHASH_SINGLE = 0x03;
    const SIGHASH_NONE = 0x02;

    let prevoutsHash = Buffer.alloc(32);
    let sequenceHash = Buffer.alloc(32);
    let outputsHash = Buffer.alloc(32);

    if (!(hashType & SIGHASH_ANYONECANPAY)) {
      if (!hashCache.hashPrevouts) {
        hashCache.hashPrevouts = this.hashPrevouts();
      }
      prevoutsHash = hashCache.hashPrevouts;
    }

    if (
      !(hashType & SIGHASH_ANYONECANPAY) &&
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashSequence) {
        hashCache.hashSequence = this.hashSequence();
      }
      sequenceHash = hashCache.hashSequence;
    }

    if (
      (hashType & 0x1f) !== SIGHASH_SINGLE &&
      (hashType & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashOutputs) {
        hashCache.hashOutputs = this.hashOutputs();
      }
      outputsHash = hashCache.hashOutputs;
    } else if (
      (hashType & 0x1f) === SIGHASH_SINGLE &&
      inputIndex < this.outputs.length
    ) {
      outputsHash = doubleBlake3Hash(this.outputs[inputIndex].toBuffer());
    }

    const writer = new BufferWriter();
    writer.writeUInt8(this.version);
    writer.writeBuffer(prevoutsHash);
    writer.writeBuffer(sequenceHash);
    writer.writeBuffer(this.inputs[inputIndex].inputTxId);
    writer.writeUInt32BE(this.inputs[inputIndex].inputTxNOut);
    writer.writeVarIntNum(script.length);
    writer.writeBuffer(script);
    writer.writeUInt64BEBigInt(amount);
    writer.writeUInt32BE(this.inputs[inputIndex].sequence);
    writer.writeBuffer(outputsHash);
    writer.writeUInt64BEBigInt(this.lockNum);
    writer.writeUInt8(hashType);
    return writer.toBuffer();
  }

  sighashNoCache(
    inputIndex: number,
    script: Buffer,
    amount: bigint,
    hashType: number,
  ): Buffer {
    const hashCache = new HashCache();
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    let hash = doubleBlake3Hash(preimage);
    return hash;
  }

  sighashWithCache(
    inputIndex: number,
    script: Buffer,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): Buffer {
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    let hash = doubleBlake3Hash(preimage);
    return hash;
  }

  signNoCache(
    inputIndex: number,
    privateKey: Buffer,
    script: Buffer,
    amount: bigint,
    hashType: number,
  ): TxSignature {
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    let sigBuf = Buffer.from(ecdsaSign(hash, privateKey).signature);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  signWithCache(
    inputIndex: number,
    privateKey: Buffer,
    script: Buffer,
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
    );
    let sigBuf = Buffer.from(ecdsaSign(hash, privateKey).signature);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  verifyNoCache(
    inputIndex: number,
    publicKey: Buffer,
    sig: TxSignature,
    script: Buffer,
    amount: bigint,
  ): boolean {
    const hashType = sig.hashType;
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    return ecdsaVerify(sig.sigBuf, hash, publicKey);
  }

  verifyWithCache(
    inputIndex: number,
    publicKey: Buffer,
    sig: TxSignature,
    script: Buffer,
    amount: bigint,
    hashCache: HashCache,
  ): boolean {
    const hashType = sig.hashType;
    const hash = this.sighashWithCache(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    return ecdsaVerify(sig.sigBuf, hash, publicKey);
  }
}
