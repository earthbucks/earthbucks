import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { Script } from "./script.js";
import { VarInt } from "./var-int.js";
import { IsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { EbxError } from "./ebx-error.js";

export class TxIn {
  public inputTxId: IsoBuf;
  public inputTxNOut: number;
  public script: Script;
  public lockRel: number;

  constructor(
    inputTxId: IsoBuf,
    inputTxNOut: number,
    script: Script,
    lockRel: number,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.lockRel = lockRel;
  }

  static fromIsoBuf(buf: IsoBuf): Result<TxIn, EbxError> {
    const reader = new IsoBufReader(buf);
    return TxIn.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<TxIn, EbxError> {
    const inputTxHashRes = reader.read(32);
    if (inputTxHashRes.err) {
      return inputTxHashRes;
    }
    const inputTxHash = inputTxHashRes.unwrap();
    const inputTxIndexRes = reader.readU32BE();
    if (inputTxIndexRes.err) {
      return inputTxIndexRes;
    }
    const inputTxIndex = inputTxIndexRes.unwrap();
    const scriptLenRes = reader.readVarIntNum();
    if (scriptLenRes.err) {
      return scriptLenRes;
    }
    const scriptLen = scriptLenRes.unwrap();
    const scriptBufRes = reader.read(scriptLen);
    if (scriptBufRes.err) {
      return scriptBufRes;
    }
    const scriptBuf = scriptBufRes.unwrap();
    const scriptRes = Script.fromIsoBuf(scriptBuf);
    if (scriptRes.err) {
      return scriptRes;
    }
    const script = scriptRes.unwrap();
    const lockRelRes = reader.readU32BE();
    if (lockRelRes.err) {
      return lockRelRes;
    }
    const lockRel = lockRelRes.unwrap();
    return Ok(new TxIn(inputTxHash, inputTxIndex, script, lockRel));
  }

  toIsoBuf(): IsoBuf {
    const writer = new IsoBufWriter();
    writer.writeIsoBuf(this.inputTxId);
    writer.writeUInt32BE(this.inputTxNOut);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeIsoBuf(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeIsoBuf(scriptBuf);
    writer.writeUInt32BE(this.lockRel);
    return writer.toIsoBuf();
  }

  isNull(): boolean {
    return (
      this.inputTxId.every((byte) => byte === 0) &&
      this.inputTxNOut === 0xffffffff
    );
  }

  isMinimalLock(): boolean {
    return this.lockRel === 0;
  }

  isCoinbase(): boolean {
    return this.isNull() && this.isMinimalLock();
  }

  static fromCoinbase(script: Script): TxIn {
    return new TxIn(IsoBuf.alloc(32), 0xffffffff, script, 0);
  }
}
