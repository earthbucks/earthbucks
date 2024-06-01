import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { SysBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";

export class VarInt {
  private buf: SysBuf;

  constructor(buf: SysBuf = SysBuf.alloc(0)) {
    this.buf = buf;
  }

  static fromBigInt(bn: bigint) {
    const buf = new IsoBufWriter().writeVarInt(bn).toIsoBuf();
    return new VarInt(buf);
  }

  static fromNumber(num: number) {
    const buf = new IsoBufWriter().writeVarIntNum(num).toIsoBuf();
    return new VarInt(buf);
  }

  toIsoBuf(): SysBuf {
    return this.buf;
  }

  toBigInt(): Result<bigint, string> {
    return new IsoBufReader(this.buf).readVarInt().mapErr((e) => e.toString());
  }

  toNumber() {
    return new IsoBufReader(this.buf).readVarIntNum();
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
    const res = this.toBigInt();
    if (res.err) {
      return false;
    }
    const bn = res.unwrap();
    const varint = VarInt.fromBigInt(bn);
    return SysBuf.compare(this.buf, varint.toIsoBuf()) === 0;
  }
}
