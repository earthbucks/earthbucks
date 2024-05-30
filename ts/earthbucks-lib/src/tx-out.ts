import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import { EbxBuffer } from "./ebx-buffer";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { EbxError } from "./ebx-error.js";

export class TxOut {
  public value: bigint;
  public script: Script;

  constructor(value: bigint, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromIsoBuf(buf: EbxBuffer): Result<TxOut, EbxError> {
    const reader = new IsoBufReader(buf);
    return TxOut.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<TxOut, EbxError> {
    const valueRes = reader.readU64BE();
    if (valueRes.err) {
      return valueRes;
    }
    const value = valueRes.unwrap();
    const scriptLenRes = reader.readVarIntNum();
    if (scriptLenRes.err) {
      return scriptLenRes;
    }
    const scriptLen = scriptLenRes.unwrap();
    const scriptArrRes = reader.read(scriptLen);
    if (scriptArrRes.err) {
      return scriptArrRes;
    }
    const scriptArr = scriptArrRes.unwrap();
    const scriptRes = Script.fromIsoBuf(scriptArr);
    if (scriptRes.err) {
      return scriptRes;
    }
    const script = scriptRes.unwrap();
    return Ok(new TxOut(value, script));
  }

  toIsoBuf(): EbxBuffer {
    const writer = new IsoBufWriter();
    writer.writeUInt64BE(this.value);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeEbxBuffer(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeEbxBuffer(scriptBuf);
    return writer.toIsoBuf();
  }
}
