import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { VarInt } from "./var-int.js";
import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { Hash } from "./hash.js";
import secp256k1 from "secp256k1";
const { ecdsaSign, ecdsaVerify } = secp256k1;
import { TxSignature } from "./tx-signature.js";
import { Script } from "./script.js";
import { SysBuf, FixedBuf } from "./buf.js";
import { EbxError, GenericError } from "./error.js";
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
  public lockAbs: U32;

  constructor(version: U8, inputs: TxIn[], outputs: TxOut[], lockAbs: U32) {
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
    const lockNum = reader.readU32BE();
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
    writer.writeU32BE(this.lockAbs);
    return writer.toBuf();
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromHex(hex: string): Tx {
    const buf = FixedBuf.fromHex(hex.length / 2, hex);
    return Tx.fromBuf(buf.buf);
  }

  static fromMintTxData(
    blockMessageId: FixedBuf<32>,
    domain: string,
    outputScript: Script,
    outputAmount: U64,
    blockNum: U32,
  ) {
    // TODO: DO NOT also allow inputting expired txs: expired txs should
    // actually be the first tx of the new block.
    const version = new U8(0);
    const inputs = [TxIn.fromMintTxData(blockMessageId, domain)];
    const txOuts = [new TxOut(outputAmount, outputScript)];
    const lockNum = blockNum;
    return new Tx(version, inputs, txOuts, lockNum);
  }

  static fromMintTxScripts(
    inputScript: Script,
    outputScript: Script,
    outputAmount: U64,
    blockNum: U32,
  ): Tx {
    // TODO: DO NOT also allow inputting expired txs: expired txs should
    // actually be the first tx of the new block.
    const version = new U8(0);
    const inputs = [TxIn.fromMintTxScript(inputScript)];
    const txOuts = [new TxOut(outputAmount, outputScript)];
    const lockNum = blockNum;
    return new Tx(version, inputs, txOuts, lockNum);
  }

  static fromMintTxTxOuts(
    inputScript: Script,
    txOuts: TxOut[],
    blockNum: U32,
  ): Tx {
    // TODO: DO NOT also allow inputting expired txs: expired txs should
    // actually be the first tx of the new block.
    const version = new U8(0);
    const txIns = [TxIn.fromMintTxScript(inputScript)];
    const lockNum = blockNum;
    return new Tx(version, txIns, txOuts, lockNum);
  }

  isMintTx(): boolean {
    // TODO: Also allow inputting expired txs
    return this.inputs.length === 1 && this.inputs[0]?.isMintTx() === true;
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
      writer.write(input.inputTxId.buf);
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
    if (inputIndex.n >= this.inputs.length) {
      throw new GenericError("input index out of bounds");
    }
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
      outputsHash = Hash.doubleBlake3Hash(
        (this.outputs[inputIndex.n] as TxOut).toBuf(),
      );
    }

    const writer = new BufWriter();
    writer.writeU8(this.version);
    writer.write(prevoutsHash.buf);
    writer.write(lockRelHash.buf);
    writer.write((this.inputs[inputIndex.n] as TxIn).inputTxId.buf);
    writer.writeU32BE((this.inputs[inputIndex.n] as TxIn).inputTxNOut);
    writer.writeVarInt(new U64(script.length));
    writer.write(script);
    writer.writeU64BE(amount);
    writer.writeU32BE((this.inputs[inputIndex.n] as TxIn).lockRel);
    writer.write(outputsHash.buf);
    writer.writeU32BE(this.lockAbs);
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
    return hash.buf;
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
    return hash.buf;
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
    return ecdsaVerify(sig.sigBuf.buf, hash, publicKey);
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
    return ecdsaVerify(sig.sigBuf.buf, hash, publicKey);
  }
}
