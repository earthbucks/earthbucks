import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import Script from "./script";
import VarInt from "./var-int";
import { Buffer } from "buffer";

export default class TxIn {
  public inputTxId: Buffer;
  public inputTxNOut: number;
  public script: Script;
  public lockRel: number;

  constructor(
    inputTxId: Buffer,
    inputTxNOut: number,
    script: Script,
    lockRel: number,
  ) {
    this.inputTxId = inputTxId;
    this.inputTxNOut = inputTxNOut;
    this.script = script;
    this.lockRel = lockRel;
  }

  static fromIsoBuf(buf: Buffer): TxIn {
    const reader = new IsoBufReader(buf);
    const inputTxHash = reader.readBuffer(32).unwrap();
    const inputTxIndex = reader.readUInt32BE().unwrap();
    const scriptLen = reader.readVarIntNum().unwrap();
    const script = Script.fromIsoBuf(
      reader.readBuffer(scriptLen).unwrap(),
    ).unwrap();
    const lockRel = reader.readUInt32BE().unwrap();
    return new TxIn(inputTxHash, inputTxIndex, script, lockRel);
  }

  static fromIsoBufReader(reader: IsoBufReader): TxIn {
    const inputTxHash = reader.readBuffer(32).unwrap();
    const inputTxIndex = reader.readUInt32BE().unwrap();
    const scriptLen = reader.readVarIntNum().unwrap();
    const script = Script.fromIsoBuf(
      reader.readBuffer(scriptLen).unwrap(),
    ).unwrap();
    const lockRel = reader.readUInt32BE().unwrap();
    return new TxIn(inputTxHash, inputTxIndex, script, lockRel);
  }

  toIsoBuf(): Buffer {
    const writer = new IsoBufWriter();
    writer.writeBuffer(this.inputTxId);
    writer.writeUInt32BE(this.inputTxNOut);
    const scriptBuf = this.script.toIsoBuf();
    writer.writeBuffer(VarInt.fromNumber(scriptBuf.length).toIsoBuf());
    writer.writeBuffer(scriptBuf);
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
    return new TxIn(Buffer.alloc(32), 0xffffffff, script, 0);
  }
}
