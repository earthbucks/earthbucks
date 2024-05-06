import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import VarInt from "./var-int";
import Script from "./script";
import { Buffer } from "buffer";

export default class TxOutput {
  public value: bigint;
  public script: Script;

  constructor(value: bigint, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromIsoBuf(buf: Buffer): TxOutput {
    const reader = new IsoBufReader(buf);
    const value = reader.readUInt64BEBigInt();
    const scriptLen = reader.readVarIntNum();
    const scriptArr = reader.readBuffer(scriptLen);
    const script = Script.fromU8Vec(scriptArr);
    return new TxOutput(value, script);
  }

  static fromIsoBufReader(reader: IsoBufReader): TxOutput {
    const value = reader.readUInt64BEBigInt();
    const scriptLen = reader.readVarIntNum();
    const scriptArr = reader.readBuffer(scriptLen);
    const script = Script.fromU8Vec(scriptArr);
    return new TxOutput(value, script);
  }

  toIsoBuf(): Buffer {
    const writer = new IsoBufWriter();
    writer.writeUInt64BEBigInt(this.value);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeBuffer(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeBuffer(scriptBuf);
    return writer.toIsoBuf();
  }
}
