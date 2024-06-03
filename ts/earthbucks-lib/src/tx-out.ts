import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import { SysBuf } from "./ebx-buf.js";
import { EbxError } from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class TxOut {
  public value: U64;
  public script: Script;

  constructor(value: U64, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromEbxBuf(buf: SysBuf): TxOut {
    const reader = new BufReader(buf);
    return TxOut.fromEbxBufReader(reader);
  }

  static fromEbxBufReader(reader: BufReader): TxOut {
    const value = reader.readU64BE();
    const scriptLen = reader.readVarInt().n;
    const scriptArr = reader.read(scriptLen);
    const script = Script.fromEbxBuf(scriptArr);
    return new TxOut(value, script);
  }

  toEbxBuf(): SysBuf {
    const writer = new BufWriter();
    writer.writeU64BE(this.value);
    const scriptBuf = this.script.toEbxBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toEbxBuf());
    writer.write(scriptBuf);
    return writer.toSysBuf();
  }
}
