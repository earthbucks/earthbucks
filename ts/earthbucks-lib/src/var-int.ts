import { IsoBufReader } from "./iso-buf-reader.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { EbxBuffer } from "./ebx-buffer";
import { Result, Ok, Err } from "earthbucks-opt-res";

export class VarInt {
  private buf: EbxBuffer;

  constructor(buf: EbxBuffer = EbxBuffer.alloc(0)) {
    this.buf = buf;
  }

  fromBigInt(bn: bigint) {
    this.buf = new IsoBufWriter().writeVarInt(bn).toIsoBuf();
    return this;
  }

  static fromBigInt(bn: bigint) {
    return new this().fromBigInt(bn);
  }

  fromNumber(num: number) {
    this.buf = new IsoBufWriter().writeVarIntNum(num).toIsoBuf();
    return this;
  }

  static fromNumber(num: number) {
    return new this().fromNumber(num);
  }

  toIsoBuf() {
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
    const varint = new VarInt().fromBigInt(bn);
    return EbxBuffer.compare(this.buf, varint.toIsoBuf()) === 0;
  }
}
