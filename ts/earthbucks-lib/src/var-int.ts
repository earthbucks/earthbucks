import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";

export default class VarInt {
  private buf: Buffer;

  constructor(buf: Buffer = Buffer.alloc(0)) {
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
    return Buffer.compare(this.buf, varint.toIsoBuf()) === 0;
  }
}
