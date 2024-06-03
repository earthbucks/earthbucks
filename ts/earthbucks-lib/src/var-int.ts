import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { SysBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { EbxError } from "./ebx-error.js";

export class VarInt {
  private buf: SysBuf;

  constructor(buf: SysBuf = SysBuf.alloc(0)) {
    this.buf = buf;
  }

  static fromU64(u64: U64) {
    const buf = new BufWriter().writeVarInt(u64).toBuf();
    return new VarInt(buf);
  }

  static fromU32(u32: U32) {
    const buf = new BufWriter().writeVarInt(new U64(u32.n)).toBuf();
    return new VarInt(buf);
  }

  toBuf(): SysBuf {
    return this.buf;
  }

  toU64(): U64 {
    return new BufReader(this.buf).readVarInt();
  }

  toU32(): U32 {
    const u64 = new BufReader(this.buf).readVarInt();
    return new U32(u64.n);
  }

  static fromBufReader(br: BufReader): VarInt {
    const buf = br.readVarIntBuf();
    return new VarInt(buf);
  }

  isMinimal() {
    try {
      const u64 = this.toU64();
      const varint = VarInt.fromU64(u64);
      return SysBuf.compare(this.buf, varint.toBuf()) === 0;
    } catch (err) {
      return false;
    }
  }
}
