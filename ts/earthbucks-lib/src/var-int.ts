import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";
import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE } from "@webbuf/numbers";

export class VarInt {
  private buf: WebBuf;

  constructor(buf: WebBuf = WebBuf.alloc(0)) {
    this.buf = buf;
  }

  static fromU64(u64: U64BE): VarInt {
    const buf = new BufWriter().writeVarIntU64BE(u64).toBuf();
    return new VarInt(buf);
  }

  static fromU32(u32: U32BE): VarInt {
    const buf = new BufWriter().writeVarIntU64BE(new U64BE(u32.n)).toBuf();
    return new VarInt(buf);
  }

  static fromNumber(n: number): VarInt {
    if (n < 0) {
      throw new Error("VarInt.fromNumber: n must be >= 0");
    }
    const u64 = new U64BE(n);
    return VarInt.fromU64(u64);
  }

  toBuf(): WebBuf {
    return this.buf;
  }

  toU64(): U64BE {
    return new BufReader(this.buf).readVarIntU64BE();
  }

  toU32(): U32BE {
    const u64 = new BufReader(this.buf).readVarIntU64BE();
    return new U32BE(u64.n);
  }

  static fromBufReader(br: BufReader): VarInt {
    const buf = br.readVarIntBEBuf();
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
