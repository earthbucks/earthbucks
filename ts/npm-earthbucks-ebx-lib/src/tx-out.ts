import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import type { WebBuf } from "@webbuf/webbuf";
import { U32BE } from "@webbuf/numbers";
import { U64BE } from "@webbuf/numbers";

export class TxOut {
  public value: U64BE; // measured in "adams".
  public script: Script;

  constructor(value: U64BE, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromBuf(buf: WebBuf): TxOut {
    const reader = new BufReader(buf);
    return TxOut.fromBufReader(reader);
  }

  static fromBufReader(reader: BufReader): TxOut {
    const value = reader.readU64BE();
    const scriptLen = reader.readVarIntU64BE().n;
    const scriptArr = reader.read(scriptLen);
    const script = Script.fromBuf(scriptArr);
    return new TxOut(value, script);
  }

  toBuf(): WebBuf {
    const writer = new BufWriter();
    writer.writeU64BE(this.value);
    const scriptBuf = this.script.toBuf();
    writer.write(VarInt.fromU32(new U32BE(scriptBuf.length)).toBuf());
    writer.write(scriptBuf);
    return writer.toBuf();
  }

  isStandardOutputScript(): boolean {
    return this.script.isStandardOutput();
  }

  clone(): TxOut {
    return new TxOut(new U64BE(this.value.bn), this.script.clone());
  }
}
