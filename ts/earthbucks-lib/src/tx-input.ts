import BufferWriter from "./buffer-writer";
import BufferReader from "./buffer-reader";
import Script from "./script";
import VarInt from "./var-int";

export default class TxInput {
  public inputTxId: Uint8Array;
  public inputTxNOut: number;
  public script: Script;
  public sequence: number;

  constructor(
    inputTxId: Uint8Array,
    inputTxNOut: number,
    script: Script,
    sequence: number,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.sequence = sequence;
  }

  static fromU8Vec(buf: Uint8Array): TxInput {
    const reader = new BufferReader(buf);
    const inputTxHash = reader.readU8Vec(32);
    const inputTxIndex = reader.readUInt32LE();
    const scriptLen = reader.readVarIntNum();
    const script = Script.fromU8Vec(reader.readU8Vec(scriptLen));
    const sequence = reader.readUInt32LE();
    return new TxInput(inputTxHash, inputTxIndex, script, sequence);
  }

  static fromBufferReader(reader: BufferReader): TxInput {
    const inputTxHash = reader.readU8Vec(32);
    const inputTxIndex = reader.readUInt32LE();
    const scriptLen = reader.readVarIntNum();
    const script = Script.fromU8Vec(reader.readU8Vec(scriptLen));
    const sequence = reader.readUInt32LE();
    return new TxInput(inputTxHash, inputTxIndex, script, sequence);
  }

  toU8Vec(): Uint8Array {
    const writer = new BufferWriter();
    writer.writeU8Vec(this.inputTxId);
    writer.writeUInt32LE(this.inputTxNOut);
    const scriptBuf = this.script.toU8Vec();
    writer.writeU8Vec(VarInt.fromNumber(scriptBuf.length).toU8Vec());
    writer.writeU8Vec(scriptBuf);
    writer.writeUInt32LE(this.sequence);
    return writer.toU8Vec();
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toU8Vec());
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
    return new TxInput(new Uint8Array(32), 0xffffffff, script, 0xffffffff);
  }
}
