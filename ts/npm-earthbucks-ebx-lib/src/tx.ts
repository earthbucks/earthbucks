import { TxIn } from "./tx-in.js";
import { TxOut } from "./tx-out.js";
import { VarInt } from "./var-int.js";
import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";
import { Hash } from "./hash.js";
import { ecdsab3Sign, ecdsab3Verify } from "./ecdsab3.js";
import { TxSignature } from "./tx-signature.js";
import { Script } from "./script.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";
import { Pkh } from "./pkh.js";
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";

export class HashCache {
  public hashPrevouts?: FixedBuf<32>;
  public hashLockRel?: FixedBuf<32>;
  public hashOutputs?: FixedBuf<32>;
}

export class Tx {
  public version: U8;
  public inputs: TxIn[];
  public outputs: TxOut[];
  public lockAbs: U32BE;

  constructor(version: U8, inputs: TxIn[], outputs: TxOut[], lockAbs: U32BE) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.lockAbs = lockAbs;
  }

  static fromBuf(buf: WebBuf): Tx {
    return Tx.fromBufReader(new BufReader(buf));
  }

  static fromBufReader(reader: BufReader): Tx {
    const version = reader.readU8();
    const numInputs = reader.readVarIntU64BE();
    const inputs = [];
    for (let i = 0; i < numInputs.n; i++) {
      const txIn = TxIn.fromBufReader(reader);
      inputs.push(txIn);
    }
    const numOutputs = reader.readVarIntU64BE();
    const outputs = [];
    for (let i = 0; i < numOutputs.n; i++) {
      const txOut = TxOut.fromBufReader(reader);
      outputs.push(txOut);
    }
    const lockNum = reader.readU32BE();
    return new Tx(version, inputs, outputs, lockNum);
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.writeU8(this.version);
    writer.write(VarInt.fromU32(new U32BE(this.inputs.length)).toBuf());
    for (const input of this.inputs) {
      writer.write(input.toBuf());
    }
    writer.write(VarInt.fromU32(new U32BE(this.outputs.length)).toBuf());
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

  static fromMintTxData({
    blockMessageId,
    domain,
    outputScript,
    outputAmount,
    blockNum,
    nonce = FixedBuf.fromRandom(32),
  }: {
    blockMessageId: FixedBuf<32>;
    domain: string;
    outputScript: Script;
    outputAmount: U64BE;
    blockNum: U32BE;
    nonce?: FixedBuf<32>;
  }): Tx {
    // TODO: DO NOT also allow inputting expired txs: expired txs should
    // actually be the first tx of the new block.
    const version = new U8(0);
    const inputs = [TxIn.fromMintTxData(blockMessageId, domain, nonce)];
    const txOuts = [new TxOut(outputAmount, outputScript)];
    const lockNum = blockNum;
    return new Tx(version, inputs, txOuts, lockNum);
  }

  static fromMintTxScripts(
    inputScript: Script,
    outputScript: Script,
    outputAmount: U64BE,
    blockNum: U32BE,
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
    blockNum: U32BE,
  ): Tx {
    // TODO: DO NOT also allow inputting expired txs: expired txs should
    // actually be the first tx of the new block.
    const version = new U8(0);
    const txIns = [TxIn.fromMintTxScript(inputScript)];
    const lockNum = blockNum;
    return new Tx(version, txIns, txOuts, lockNum);
  }

  /**
   * A mint transaction is a special transaction at the end of every block that
   * has one "new" input that creates new earthbucks. All other inputs, if they
   * exist, must be "expired", meaning they are spending expired outputs. Normal
   * inputs are not allowed in a mint transaction. Other transaction types
   * cannot have either "new" or "expired" inputs.
   * @returns Whether this transaction is a mint transaction.
   */
  isMintTx(): boolean {
    if (this.inputs.length < 1) {
      return false;
    }
    if (!(this.inputs[0] as TxIn).isMintTx()) {
      return false;
    }
    for (let i = 1; i < this.inputs.length; i++) {
      if (!(this.inputs[i] as TxIn).isExpiredInputScript()) {
        return false;
      }
    }
    return true;
  }

  isStandardTx(): boolean {
    if (this.inputs.length < 1) {
      return false;
    }
    for (let i = 0; i < this.inputs.length; i++) {
      if (!(this.inputs[i] as TxIn).isStandardInputScript()) {
        return false;
      }
    }
    if (this.outputs.length < 1) {
      return false;
    }
    for (let i = 0; i < this.outputs.length; i++) {
      if (!(this.outputs[i] as TxOut).isStandardOutputScript()) {
        return false;
      }
    }
    return true;
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
    inputIndex: U32BE,
    script: WebBuf,
    amount: U64BE,
    hashType: U8,
    hashCache: HashCache,
  ): WebBuf {
    if (inputIndex.n >= this.inputs.length) {
      throw new Error("input index out of bounds");
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
    writer.writeVarIntU64BE(new U64BE(script.length));
    writer.write(script);
    writer.writeU64BE(amount);
    writer.writeU32BE((this.inputs[inputIndex.n] as TxIn).lockRel);
    writer.write(outputsHash.buf);
    writer.writeU32BE(this.lockAbs);
    writer.writeU8(hashType);
    return writer.toBuf();
  }

  sighashNoCache(
    inputIndex: U32BE,
    script: WebBuf,
    amount: U64BE,
    hashType: U8,
  ): FixedBuf<32> {
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
    inputIndex: U32BE,
    script: WebBuf,
    amount: U64BE,
    hashType: U8,
    hashCache: HashCache,
  ): FixedBuf<32> {
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
    inputIndex: U32BE,
    privKey: PrivKey,
    script: WebBuf,
    amount: U64BE,
    hashType: U8,
  ): TxSignature {
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    const sigBuf = ecdsab3Sign(hash, privKey);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  signWithCache(
    inputIndex: U32BE,
    privKey: PrivKey,
    script: WebBuf,
    amount: U64BE,
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
    const sigBuf = ecdsab3Sign(hash, privKey);
    const sig = new TxSignature(hashType, sigBuf);
    return sig;
  }

  verifyNoCache(
    inputIndex: U32BE,
    publicKey: WebBuf,
    sig: TxSignature,
    script: WebBuf,
    amount: U64BE,
  ): boolean {
    const hashType = sig.hashType;
    const hash = this.sighashNoCache(inputIndex, script, amount, hashType);
    return ecdsab3Verify(
      sig.sigBuf,
      hash,
      PubKey.fromBuf(FixedBuf.fromBuf(33, publicKey)),
    );
  }

  verifyWithCache(
    inputIndex: U32BE,
    publicKey: WebBuf,
    sig: TxSignature,
    script: WebBuf,
    amount: U64BE,
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
    return ecdsab3Verify(
      sig.sigBuf,
      hash,
      PubKey.fromBuf(FixedBuf.fromBuf(33, publicKey)),
    );
  }

  /**
   * In order to know if your key is in a tx, you can use this method to get all
   * keys (pub key hash, or Pkh) in the outputs. This gets both normal pkh and
   * recovery pkh.
   * @returns The public key hashes of all the keys in all the outputs in this
   * transaction.
   */
  getAllOutputPkhs(): Pkh[] {
    const txOuts = this.outputs;
    const pkhs: Pkh[] = [];
    for (const txOut of txOuts) {
      try {
        const pkhObj = txOut.script.getOutputPkhs();
        pkhs.push(pkhObj.pkh);
        if (pkhObj.rpkh) {
          pkhs.push(pkhObj.rpkh);
        }
      } catch (e) {
        // Do nothing.
      }
    }
    return pkhs;
  }

  // /**
  //  * This gets all input pkhs in the transaction, whether they are normal or
  //  * recovery. If the input script is not a pkh, it is ignored.
  //  * @returns The public key hashes of all the keys in all the inputs in this
  //  * transaction.
  //  */
  // getAllInputPkhs(): Pkh[] {
  //   const txIns = this.inputs;
  //   const pkhs: Pkh[] = [];
  //   for (const txIn of txIns) {
  //     try {
  //       const pkh = txIn.script.getInputPkh();
  //       pkhs.push(pkh);
  //     } catch (e) {
  //       // Do nothing.
  //     }
  //   }
  //   return pkhs;
  // }

  // /**
  //  * This gets all pkhs in the transaction, whether they are normal or recovery.
  //  * @returns The public key hashes of all the keys in all the inputs and
  //  * outputs in this transaction.
  //  */
  // getAllPkhs(): Pkh[] {
  //   return [...this.getAllInputPkhs(), ...this.getAllOutputPkhs()];
  // }

  clone(): Tx {
    const inputs = this.inputs.map((input) => input.clone());
    const outputs = this.outputs.map((output) => output.clone());
    return new Tx(
      new U8(this.version.n),
      inputs,
      outputs,
      new U32BE(this.lockAbs.n),
    );
  }
}
