import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { VarInt } from "./var-int.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import * as Hash from "./hash.js";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import { TxSignature } from "./tx-signature.js";
import { Script } from "./script.js";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { EbxError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class HashCache {
  public hashPrevouts?: FixedBuf<32>;
  public hashLockRel?: FixedBuf<32>;
  public hashOutputs?: FixedBuf<32>;
}

export class Tx {
  public version: U8;
  public inputs: TxIn[];
  public outputs: TxOut[];
  public lockAbs: U64;

  constructor(version: U8, inputs: TxIn[], outputs: TxOut[], lockAbs: U64) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.lockAbs = lockAbs;
  }

  static fromBuf(buf: SysBuf): Tx {
    return Tx.fromBufReader(new BufReader(buf));
  }

  static fromBufReader(reader: BufReader): Tx {
    const version = reader.readU8();
    const numInputs = reader.readVarInt();
    const inputs = [];
    for (let i = 0; i < numInputs.n; i++) {
      const txIn = TxIn.fromBufReader(reader);
      inputs.push(txIn);
    }
    const numOutputs = reader.readVarInt();
    const outputs = [];
    for (let i = 0; i < numOutputs.n; i++) {
      const txOut = TxOut.fromBufReader(reader);
      outputs.push(txOut);
    }
    const lockNum = reader.readU64BE();
    return new Tx(version, inputs, outputs, lockNum);
  }

  toBuf(): SysBuf {
    const writer = new BufWriter();
    writer.writeU8(this.version);
    writer.write(VarInt.fromU32(new U32(this.inputs.length)).toBuf());
    for (const input of this.inputs) {
      writer.write(input.toBuf());
    }
    writer.write(VarInt.fromU32(new U32(this.outputs.length)).toBuf());
    for (const output of this.outputs) {
      writer.write(output.toBuf());
    }
    writer.writeU64BE(this.lockAbs);
    return writer.toBuf();
  }

  toStrictHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromStrictHex(hex: string): Tx {
    const buf = FixedBuf.fromStrictHex(hex.length / 2, hex);
    return Tx.fromBuf(buf);
  }

  static fromCoinbase(
    inputScript: Script,
    outputScript: Script,
    outputAmount: U64,
  ): Tx {
    const version = new U8(0);
    const inputs = [TxIn.fromCoinbase(inputScript)];
    const outputs = [new TxOut(outputAmount, outputScript)];
    const lockNum = new U64(0);
    return new Tx(version, inputs, outputs, lockNum);
  }

  isCoinbase(): boolean {
    return this.inputs.length === 1 && this.inputs[0].isCoinbase();
  }

  blake3Hash(): FixedBuf<32> {
    return Hash.blake3Hash(this.toBuf());
  }

  id(): FixedBuf<32> {
    return Hash.doubleBlake3Hash(this.toBuf());
  }

  hashPrevouts(): FixedBuf<32> {
    const writer = new BufWriter();
    for (const input of this.inputs) {
      writer.write(input.inputTxId);
      writer.writeU32BE(input.inputTxNOut);
    }
    return Hash.doubleBlake3Hash(writer.toBuf());
  }

  hashLockRel(): FixedBuf<32> {
    const writer = new BufWriter();
    for (const input of this.inputs) {
      writer.writeU32BE(input.lockRel);
    }
    return Hash.doubleBlake3Hash(writer.toBuf());
  }

  hashOutputs(): FixedBuf<32> {
    const writer = new BufWriter();
    for (const output of this.outputs) {
      writer.write(output.toBuf());
    }
    return Hash.doubleBlake3Hash(writer.toBuf());
  }

  sighashPreimage(
    inputIndex: U32,
    script: SysBuf,
    amount: U64,
    hashType: U8,
    hashCache: HashCache,
  ): SysBuf {
    const SIGHASH_ANYONECANPAY = 0x80;
    const SIGHASH_SINGLE = 0x03;
    const SIGHASH_NONE = 0x02;

    let prevoutsHash = FixedBuf.alloc(32);
    let lockRelHash = FixedBuf.alloc(32);
    let outputsHash = FixedBuf.alloc(32);

    if (!(hashType.n & SIGHASH_ANYONECANPAY)) {
      if (!hashCache.hashPrevouts) {
        hashCache.hashPrevouts = this.hashPrevouts();
      }
      prevoutsHash = hashCache.hashPrevouts;
    }

    if (
      !(hashType.n & SIGHASH_ANYONECANPAY) &&
      (hashType.n & 0x1f) !== SIGHASH_SINGLE &&
      (hashType.n & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashLockRel) {
        hashCache.hashLockRel = this.hashLockRel();
      }
      lockRelHash = hashCache.hashLockRel;
    }

    if (
      (hashType.n & 0x1f) !== SIGHASH_SINGLE &&
      (hashType.n & 0x1f) !== SIGHASH_NONE
    ) {
      if (!hashCache.hashOutputs) {
        hashCache.hashOutputs = this.hashOutputs();
      }
      outputsHash = hashCache.hashOutputs;
    } else if (
      (hashType.n & 0x1f) === SIGHASH_SINGLE &&
      inputIndex.n < this.outputs.length
    ) {
      outputsHash = Hash.doubleBlake3Hash(this.outputs[inputIndex.n].toBuf());
    }

    const writer = new BufWriter();
    writer.writeU8(this.version);
    writer.write(prevoutsHash);
    writer.write(lockRelHash);
    writer.write(this.inputs[inputIndex.n].inputTxId);
    writer.writeU32BE(this.inputs[inputIndex.n].inputTxNOut);
    writer.writeVarInt(new U64(script.length));
    writer.write(script);
    writer.writeU64BE(amount);
    writer.writeU32BE(this.inputs[inputIndex.n].lockRel);
    writer.write(outputsHash);
    writer.writeU64BE(this.lockAbs);
    writer.writeU8(hashType);
    return writer.toBuf();
  }

  sighashNoCache(
    inputIndex: U32,
    script: SysBuf,
    amount: U64,
    hashType: U8,
  ): SysBuf {
    const hashCache = new HashCache();
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    const hash = Hash.doubleBlake3Hash(preimage);
    return hash;
  }

  sighashWithCache(
    inputIndex: U32,
    script: SysBuf,
    amount: U64,
    hashType: U8,
    hashCache: HashCache,
  ): SysBuf {
    const preimage = this.sighashPreimage(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    const hash = Hash.doubleBlake3Hash(preimage);
    return hash;
  }

  signNoCache(
    inputIndex: U32,
    privateKey: SysBuf,
    script: SysBuf,
    amount: U64,
    hashType: U8,
  ): TxSignature {
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    const sigBuf = FixedBuf.fromBuf(
      64,
      SysBuf.from(ecdsaSign(hash, privateKey).signature),
    );
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  signWithCache(
    inputIndex: U32,
    privateKey: SysBuf,
    script: SysBuf,
    amount: U64,
    hashType: U8,
    hashCache: HashCache,
  ): TxSignature {
    const hash = this.sighashWithCache(
      inputIndex,
      script,
      amount,
      hashType,
      hashCache,
    );
    const sigBuf = FixedBuf.fromBuf(
      64,
      SysBuf.from(ecdsaSign(hash, privateKey).signature),
    );
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  verifyNoCache(
    inputIndex: U32,
    publicKey: SysBuf,
    sig: TxSignature,
    script: SysBuf,
    amount: U64,
  ): boolean {
    const hashType = sig.hashType;
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    return ecdsaVerify(sig.sigBuf, hash, publicKey);
  }

  verifyWithCache(
    inputIndex: U32,
    publicKey: SysBuf,
    sig: TxSignature,
    script: SysBuf,
    amount: U64,
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
