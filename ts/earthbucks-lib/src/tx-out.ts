import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import type { WebBuf } from "./buf.js";
import { U32 } from "./numbers.js";
import { U64 } from "./numbers.js";

export class TxOut {
  public value: U64; // measured in "adams".
  public script: Script;

  constructor(value: U64, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromBuf(buf: WebBuf): TxOut {
    const reader = new BufReader(buf);
    return TxOut.fromBufReader(reader);
  }

  static fromBufReader(reader: BufReader): TxOut {
    const value = reader.readU64BE();
    const scriptLen = reader.readVarInt().n;
    const scriptArr = reader.read(scriptLen);
    const script = Script.fromBuf(scriptArr);
    return new TxOut(value, script);
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.writeU64BE(this.value);
    const scriptBuf = this.script.toBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toBuf());
    writer.write(scriptBuf);
    return writer.toBuf();
  }

  isStandardOutputScript(): boolean {
    return this.script.isStandardOutput();
  }

  clone(): TxOut {
    return new TxOut(new U64(this.value.bn), this.script.clone());
  }
}
