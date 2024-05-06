import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import Script from "./script";
import VarInt from "./var-int";
import { Buffer } from "buffer";

export default class TxInput {
  public inputTxId: Buffer;
  public inputTxNOut: number;
  public script: Script;
  public sequence: number;

  constructor(
    inputTxId: Buffer,
    inputTxNOut: number,
    script: Script,
    sequence: number,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.sequence = sequence;
  }

  static fromIsoBuf(buf: Buffer): TxInput {
    const reader = new IsoBufReader(buf);
    const inputTxHash = reader.readBuffer(32);
    const inputTxIndex = reader.readUInt32LE();
    const scriptLen = reader.readVarIntNum();
    const script = Script.fromU8Vec(reader.readBuffer(scriptLen));
    const sequence = reader.readUInt32LE();
    return new TxInput(inputTxHash, inputTxIndex, script, sequence);
  }

  static fromIsoBufReader(reader: IsoBufReader): TxInput {
    const inputTxHash = reader.readBuffer(32);
    const inputTxIndex = reader.readUInt32LE();
    const scriptLen = reader.readVarIntNum();
    const script = Script.fromU8Vec(reader.readBuffer(scriptLen));
    const sequence = reader.readUInt32LE();
    return new TxInput(inputTxHash, inputTxIndex, script, sequence);
  }

  toIsoBuf(): Buffer {
    const writer = new IsoBufWriter();
    writer.writeBuffer(this.inputTxId);
    writer.writeUInt32LE(this.inputTxNOut);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeBuffer(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeBuffer(scriptBuf);
    writer.writeUInt32LE(this.sequence);
    return writer.toIsoBuf();
  }

  isNull(): boolean {
    return (
      this.inputTxId.every((byte) => byte === 0) &&
      this.inputTxNOut === 0xffffffff
    );
  }

  isFinal(): boolean {
    return this.sequence === 0xffffffff;
  }

  isCoinbase(): boolean {
    return this.isNull() && this.isFinal();
  }

  static fromCoinbase(script: Script): TxInput {
    return new TxInput(Buffer.alloc(32), 0xffffffff, script, 0xffffffff);
  }
}
