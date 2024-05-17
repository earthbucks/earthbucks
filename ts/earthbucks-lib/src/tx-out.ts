import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import VarInt from "./var-int";
import Script from "./script";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";

export default class TxOut {
  public value: bigint;
  public script: Script;

  constructor(value: bigint, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromIsoBuf(buf: Buffer): Result<TxOut, string> {
    const reader = new IsoBufReader(buf);
    return TxOut.fromIsoBufReader(reader);
  }

  static fromIsoBufReader(reader: IsoBufReader): Result<TxOut, string> {
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

  toIsoBuf(): Buffer {
    const writer = new IsoBufWriter();
    writer.writeUInt64BE(this.value);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeBuffer(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeBuffer(scriptBuf);
    return writer.toIsoBuf();
  }
}
