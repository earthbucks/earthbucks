import IsoBufReader from "./iso-buf-reader";
import IsoBufWriter from "./iso-buf-writer";
import { Buffer } from "buffer";

export default class VarInt {
  private buf: Buffer;

  constructor(buf: Buffer = Buffer.alloc(0)) {
    this.buf = buf;
  }

  fromBigInt(bn: bigint) {
    this.buf = new IsoBufWriter().writeVarIntBigInt(bn).toIsoBuf();
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

  toBigInt(): bigint {
    return new IsoBufReader(this.buf).readVarIntBigInt();
  }

  toNumber() {
    return new IsoBufReader(this.buf).readVarIntNum();
  }

  static fromIsoBufReader(br: IsoBufReader): VarInt {
    const buf = Buffer.from(br.readVarIntBuf());
    return new VarInt(buf);
  }

  isMinimal() {
    const bn = this.toBigInt();
    const varint = new VarInt().fromBigInt(bn);
    return Buffer.compare(this.buf, varint.toIsoBuf()) === 0;
  }
}
