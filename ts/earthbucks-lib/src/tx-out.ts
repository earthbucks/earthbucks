import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import VarInt from "./var-int";
import Script from "./script";
import { Buffer } from "buffer";

export default class TxOut {
  public value: bigint;
  public script: Script;

  constructor(value: bigint, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromIsoBuf(buf: Buffer): TxOut {
    const reader = new IsoBufReader(buf);
    const value = reader.readUInt64BE().unwrap();
    const scriptLen = reader.readVarIntNum().unwrap();
    const scriptArr = reader.readIsoBuf(scriptLen).unwrap();
    const script = Script.fromIsoBuf(scriptArr).unwrap();
    return new TxOut(value, script);
  }

  static fromIsoBufReader(reader: IsoBufReader): TxOut {
    const value = reader.readUInt64BE().unwrap();
    const scriptLen = reader.readVarIntNum().unwrap();
    const scriptArr = reader.readIsoBuf(scriptLen).unwrap();
    const script = Script.fromIsoBuf(scriptArr).unwrap();
    return new TxOut(value, script);
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
