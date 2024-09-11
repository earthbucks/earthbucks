import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { VarInt } from "./var-int.js";
import { Script } from "./script.js";
import type { SysBuf } from "./buf.js";
import { U32 } from "./numbers.js";
import type { U64 } from "./numbers.js";

export class TxOut {
  public value: U64;
  public script: Script;

  constructor(value: U64, script: Script) {
    this.value = value;
    this.script = script;
  }

  static fromBuf(buf: SysBuf): TxOut {
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

  toBuf(): SysBuf {
    const writer = new BufWriter();
    writer.writeU64BE(this.value);
    const scriptBuf = this.script.toBuf();
    writer.write(VarInt.fromU32(new U32(scriptBuf.length)).toBuf());
    writer.write(scriptBuf);
    return writer.toBuf();
  }
}
