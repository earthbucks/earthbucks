import BufferReader from "./buffer-reader";
import BufferWriter from "./buffer-writer";
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

  static fromBuffer(buf: Buffer): TxOutput {
    const reader = new BufferReader(buf);
    const value = reader.readUInt64BEBigInt();
    const scriptLen = reader.readVarIntNum();
    const scriptArr = reader.readBuffer(scriptLen);
    const script = Script.fromU8Vec(scriptArr);
    return new TxOutput(value, script);
  }

  static fromBufferReader(reader: BufferReader): TxOutput {
    const value = reader.readUInt64BEBigInt();
    const scriptLen = reader.readVarIntNum();
    const scriptArr = reader.readBuffer(scriptLen);
    const script = Script.fromU8Vec(scriptArr);
    return new TxOutput(value, script);
  }

  toBuffer(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt64BEBigInt(this.value);
    const scriptBuf = this.script.toBuffer();
    writer.writeBuffer(VarInt.fromNumber(scriptBuf.length).toBuffer());
    writer.writeBuffer(scriptBuf);
    return writer.toBuffer();
  }
}
