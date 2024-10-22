import { BufReader } from "./buf-reader.js";
import { BufWriter } from "./buf-writer.js";
import { WebBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class VarInt {
  private buf: WebBuf;

  constructor(buf: WebBuf = WebBuf.alloc(0)) {
    this.buf = buf;
  }

  static fromU64(u64: U64): VarInt {
    const buf = new BufWriter().writeVarInt(u64).toBuf();
    return new VarInt(buf);
  }

  static fromU32(u32: U32): VarInt {
    const buf = new BufWriter().writeVarInt(new U64(u32.n)).toBuf();
    return new VarInt(buf);
  }

  static fromNumber(n: number): VarInt {
    if (n < 0) {
      throw new Error("VarInt.fromNumber: n must be >= 0");
    }
    const u64 = new U64(n);
    return VarInt.fromU64(u64);
  }

  toBuf(): WebBuf {
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

  isMinimal(): boolean {
    try {
      const u64 = this.toU64();
      const varint = VarInt.fromU64(u64);
      return WebBuf.compare(this.buf, varint.toBuf()) === 0;
    } catch (err) {
      return false;
    }
  }
}
