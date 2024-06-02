import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import { SysBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { EbxError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxOut {
  public value: U64;
  public script: Script;

  constructor(value: U64, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromIsoBuf(buf: SysBuf): Result<TxOut, EbxError> {
    const reader = new IsoBufReader(buf);
    return TxOut.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<TxOut, EbxError> {
    const valueRes = reader.readU64BE();
    if (valueRes.err) {
      return valueRes;
    }
    const value = valueRes.unwrap();
    const scriptLenRes = reader.readVarInt();
    if (scriptLenRes.err) {
      return scriptLenRes;
    }
    const scriptLen = scriptLenRes.unwrap().n;
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

  toIsoBuf(): SysBuf {
    const writer = new IsoBufWriter();
    writer.writeU64BE(this.value);
    const scriptBuf = this.script.toIsoBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toIsoBuf());
    writer.write(scriptBuf);
    return writer.toIsoBuf();
  }
}
