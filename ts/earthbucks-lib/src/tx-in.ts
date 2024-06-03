import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { Script } from "./script.js";
import { VarInt } from "./var-int.js";
import { FixedBuf, SysBuf } from "./ebx-buf.js";
import { EbxError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxIn {
  public inputTxId: FixedBuf<32>;
  public inputTxNOut: U32;
  public script: Script;
  public lockRel: U32;

  constructor(
    inputTxId: FixedBuf<32>,
    inputTxNOut: U32,
    script: Script,
    lockRel: U32,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.lockRel = lockRel;
  }

  static fromEbxBuf(buf: SysBuf): TxIn {
    const reader = new BufReader(buf);
    return TxIn.fromEbxBufReader(reader);
  }

  static fromEbxBufReader(reader: BufReader): TxIn {
    const inputTxHash = reader.readFixed(32);
    const inputTxIndex = reader.readU32BE();
    const scriptLen = reader.readVarInt().n;
    const scriptBuf = reader.read(scriptLen);
    const script = Script.fromEbxBuf(scriptBuf);
    const lockRel = reader.readU32BE();
    return new TxIn(inputTxHash, inputTxIndex, script, lockRel);
  }

  toEbxBuf(): SysBuf {
    const writer = new BufWriter();
    writer.write(this.inputTxId);
    writer.writeU32BE(this.inputTxNOut);
    const scriptBuf = this.script.toEbxBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toEbxBuf());
    writer.write(scriptBuf);
    writer.writeU32BE(this.lockRel);
    return writer.toSysBuf();
  }

  isNull(): boolean {
    return (
      this.inputTxId.every((byte) => byte === 0) &&
      this.inputTxNOut.n === 0xffffffff
    );
  }

  isMinimalLock(): boolean {
    return this.lockRel.n === 0;
  }

  isCoinbase(): boolean {
    return this.isNull() && this.isMinimalLock();
  }

  static fromCoinbase(script: Script): TxIn {
    const emptyId = FixedBuf.alloc(32);
    return new TxIn(emptyId, new U32(0xffffffff), script, new U32(0));
  }
}
