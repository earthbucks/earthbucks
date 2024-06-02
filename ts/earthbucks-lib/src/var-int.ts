import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { SysBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { EbxError } from "./ebx-error.js";

export class VarInt {
  private buf: SysBuf;

  constructor(buf: SysBuf = SysBuf.alloc(0)) {
    this.buf = buf;
  }

  static fromU64(u64: U64) {
    const buf = new IsoBufWriter().writeVarInt(u64).toIsoBuf();
    return new VarInt(buf);
  }

  static fromU32(u32: U32) {
    const buf = new IsoBufWriter().writeVarInt(new U64(u32.n)).toIsoBuf();
    return new VarInt(buf);
  }

  toIsoBuf(): SysBuf {
    return this.buf;
  }

  toU64(): Result<U64, EbxError> {
    return new IsoBufReader(this.buf).readVarInt();
  }

  toU32(): Result<U32, EbxError> {
    const u64Res = new IsoBufReader(this.buf).readVarInt();
    if (u64Res.err) {
      return Err(u64Res.val);
    }
    const u64 = u64Res.unwrap();
    return Ok(new U32(u64.n));
  }

  static fromIsoBufReader(br: IsoBufReader): Result<VarInt, string> {
    const res = br.readVarIntBuf();
    if (res.err) {
      return Err(res.val.toString());
    }
    const buf = res.unwrap();
    return Ok(new VarInt(buf));
  }

  isMinimal() {
    const res = this.toU64();
    if (res.err) {
      return false;
    }
    const bn = res.unwrap();
    const varint = VarInt.fromU64(bn);
    return SysBuf.compare(this.buf, varint.toIsoBuf()) === 0;
  }
}
