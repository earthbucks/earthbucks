import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { VarInt } from "./var-int.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import * as Hash from "./hash.js";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import { TxSignature } from "./tx-signature.js";
import { Script } from "./script.js";
import { IsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { StrictHex } from "./strict-hex.js";
import { EbxError } from "./ebx-error.js";

export class HashCache {
  public hashPrevouts?: IsoBuf;
  public hashLockRel?: IsoBuf;
  public hashOutputs?: IsoBuf;
}

export class Tx {
  public version: number;
  public inputs: TxIn[];
  public outputs: TxOut[];
  public lockAbs: bigint;

  constructor(
    version: number,
    inputs: TxIn[],
    outputs: TxOut[],
    lockAbs: bigint,
  ) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.lockAbs = lockAbs;
  }

  static fromIsoBuf(buf: IsoBuf): Result<Tx, EbxError> {
    return Tx.fromIsoBufReader(new IsoBufReader(buf));
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<Tx, EbxError> {
    const versionRes = reader.readU8();
    if (versionRes.err) {
      return versionRes;
    }
    const version = versionRes.unwrap();
    const numInputsRes = reader.readVarIntNum();
    if (numInputsRes.err) {
      return numInputsRes;
    }
    const numInputs = numInputsRes.unwrap();
    const inputs = [];
    for (let i = 0; i < numInputs; i++) {
      const txInRes = TxIn.fromIsoBufReader(reader);
      if (txInRes.err) {
        return txInRes;
      }
      const txIn = txInRes.unwrap();
      inputs.push(txIn);
    }
    const numOutputsRes = reader.readVarIntNum();
    if (numOutputsRes.err) {
      return numOutputsRes;
    }
    const numOutputs = numOutputsRes.unwrap();
    const outputs = [];
    for (let i = 0; i < numOutputs; i++) {
      const txOutRes = TxOut.fromIsoBufReader(reader);
      if (txOutRes.err) {
        return txOutRes;
      }
      const txOut = txOutRes.unwrap();
      outputs.push(txOut);
    }
    const lockNumRes = reader.readU64BE();
    if (lockNumRes.err) {
      return lockNumRes;
    }
    const lockNum = lockNumRes.unwrap();
    return Ok(new Tx(version, inputs, outputs, BigInt(lockNum)));
  }

  toIsoBuf(): IsoBuf {
    const writer = new IsoBufWriter();
    writer.writeUInt8(this.version);
    writer.writeIsoBuf(VarInt.fromNumber(this.inputs.length).toIsoBuf());
    for (const input of this.inputs) {
      writer.writeIsoBuf(input.toIsoBuf());
    }
    writer.writeIsoBuf(VarInt.fromNumber(this.outputs.length).toIsoBuf());
    for (const output of this.outputs) {
      writer.writeIsoBuf(output.toIsoBuf());
    }
    writer.writeUInt64BE(this.lockAbs);
    return writer.toIsoBuf();
  }

  toIsoHex(): string {
    return this.toIsoBuf().toString("hex");
  }

  static fromIsoHex(hex: string): Result<Tx, EbxError> {
    const bufRes = StrictHex.decode(hex);
    if (bufRes.err) {
      return bufRes;
    }
    const buf = bufRes.unwrap();
    return Tx.fromIsoBuf(buf);
  }

  static fromCoinbase(
    inputScript: Script,
    outputScript: Script,
    outputAmount: bigint,
  ): Tx {
    const version = 1;
    const inputs = [TxIn.fromCoinbase(inputScript)];
    const outputs = [new TxOut(outputAmount, outputScript)];
    const lockNum = BigInt(0);
    return new Tx(version, inputs, outputs, lockNum);
  }

  isCoinbase(): boolean {
    return this.inputs.length === 1 && this.inputs[0].isCoinbase();
  }

  blake3Hash(): IsoBuf {
    return Hash.blake3Hash(this.toIsoBuf());
  }

  id(): IsoBuf {
    return Hash.doubleBlake3Hash(this.toIsoBuf());
  }

  hashPrevouts(): IsoBuf {
    const writer = new IsoBufWriter();
    for (const input of this.inputs) {
      writer.writeIsoBuf(input.inputTxId);
      writer.writeUInt32BE(input.inputTxNOut);
    }
    return Hash.doubleBlake3Hash(writer.toIsoBuf());
  }

  hashLockRel(): IsoBuf {
    const writer = new IsoBufWriter();
    for (const input of this.inputs) {
      writer.writeUInt32BE(input.lockRel);
    }
    return Hash.doubleBlake3Hash(writer.toIsoBuf());
  }

  hashOutputs(): IsoBuf {
    const writer = new IsoBufWriter();
    for (const output of this.outputs) {
      writer.writeIsoBuf(output.toIsoBuf());
    }
    return Hash.doubleBlake3Hash(writer.toIsoBuf());
  }

  sighashPreimage(
    inputIndex: number,
    script: IsoBuf,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): IsoBuf {
    const SIGHASH_ANYONECANPAY = 0x80;
    const SIGHASH_SINGLE = 0x03;
    const SIGHASH_NONE = 0x02;

    let prevoutsHash = IsoBuf.alloc(32);
    let lockRelHash = IsoBuf.alloc(32);
    let outputsHash = IsoBuf.alloc(32);

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
      if (!hashCache.hashLockRel) {
        hashCache.hashLockRel = this.hashLockRel();
      }
      lockRelHash = hashCache.hashLockRel;
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
      outputsHash = Hash.doubleBlake3Hash(this.outputs[inputIndex].toIsoBuf());
    }

    const writer = new IsoBufWriter();
    writer.writeUInt8(this.version);
    writer.writeIsoBuf(prevoutsHash);
    writer.writeIsoBuf(lockRelHash);
    writer.writeIsoBuf(this.inputs[inputIndex].inputTxId);
    writer.writeUInt32BE(this.inputs[inputIndex].inputTxNOut);
    writer.writeVarIntNum(script.length);
    writer.writeIsoBuf(script);
    writer.writeUInt64BE(amount);
    writer.writeUInt32BE(this.inputs[inputIndex].lockRel);
    writer.writeIsoBuf(outputsHash);
    writer.writeUInt64BE(this.lockAbs);
    writer.writeUInt8(hashType);
    return writer.toIsoBuf();
  }

  sighashNoCache(
    inputIndex: number,
    script: IsoBuf,
    amount: bigint,
    hashType: number,
  ): IsoBuf {
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
    inputIndex: number,
    script: IsoBuf,
    amount: bigint,
    hashType: number,
    hashCache: HashCache,
  ): IsoBuf {
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
    inputIndex: number,
    privateKey: IsoBuf,
    script: IsoBuf,
    amount: bigint,
    hashType: number,
  ): TxSignature {
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    const sigBuf = IsoBuf.from(ecdsaSign(hash, privateKey).signature);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  signWithCache(
    inputIndex: number,
    privateKey: IsoBuf,
    script: IsoBuf,
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
    const sigBuf = IsoBuf.from(ecdsaSign(hash, privateKey).signature);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  verifyNoCache(
    inputIndex: number,
    publicKey: IsoBuf,
    sig: TxSignature,
    script: IsoBuf,
    amount: bigint,
  ): boolean {
    const hashType = sig.hashType;
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    return ecdsaVerify(sig.sigBuf, hash, publicKey);
  }

  verifyWithCache(
    inputIndex: number,
    publicKey: IsoBuf,
    sig: TxSignature,
    script: IsoBuf,
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
