import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { Script } from "./script.js";
import { VarInt } from "./var-int.js";
import { FixedIsoBuf, SysBuf } from "./iso-buf.js";
import { EbxError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxIn {
  public inputTxId: FixedIsoBuf<32>;
  public inputTxNOut: U32;
  public script: Script;
  public lockRel: U32;

  constructor(
    inputTxId: FixedIsoBuf<32>,
    inputTxNOut: U32,
    script: Script,
    lockRel: U32,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.lockRel = lockRel;
  }

  static fromIsoBuf(buf: SysBuf): TxIn {
    const reader = new IsoBufReader(buf);
    return TxIn.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): TxIn {
    const inputTxHash = reader.readFixed(32);
    const inputTxIndex = reader.readU32BE();
    const scriptLen = reader.readVarInt().n;
    const scriptBuf = reader.read(scriptLen);
    const script = Script.fromIsoBuf(scriptBuf);
    const lockRel = reader.readU32BE();
    return new TxIn(inputTxHash, inputTxIndex, script, lockRel);
  }

  toIsoBuf(): SysBuf {
    const writer = new IsoBufWriter();
    writer.write(this.inputTxId);
    writer.writeU32BE(this.inputTxNOut);
    const scriptBuf = this.script.toIsoBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toIsoBuf());
    writer.write(scriptBuf);
    writer.writeU32BE(this.lockRel);
    return writer.toIsoBuf();
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
    const emptyId = FixedIsoBuf.alloc(32);
    return new TxIn(emptyId, new U32(0xffffffff), script, new U32(0));
  }
}
