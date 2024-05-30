import { IsoBuf } from "./iso-buf.js";

export class Writer {
  bufs: IsoBuf[];

  constructor(bufs?: IsoBuf[]) {
    this.bufs = bufs ? bufs.map((isoBuf) => isoBuf) : [];
  }

  getLength(): number {
    let len = 0;
    for (const buf of this.bufs) {
      len += buf.length;
    }
    return len;
  }

  toIsoBuf(): IsoBuf {
    return IsoBuf.concat(this.bufs);
  }

  writeIsoBuf(buf: IsoBuf): this {
    this.bufs.push(buf);
    return this;
  }

  writeU8(n: number): this {
    const buf = IsoBuf.alloc(1);
    buf.writeU8(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeU16BE(n: number): this {
    const buf = IsoBuf.alloc(2);
    buf.writeU16BE(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeU32BE(n: number): this {
    const buf = IsoBuf.alloc(4);
    buf.writeU32BE(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeU64BE(bn: bigint): this {
    const buf = IsoBuf.alloc(8);
    buf.writeU64BE(bn, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeVarIntNum(n: number): this {
    const buf = Writer.varIntBufNum(n);
    this.writeIsoBuf(buf);
    return this;
  }

  writeVarInt(bn: bigint): this {
    const buf = Writer.varIntBuf(bn);
    this.writeIsoBuf(buf);
    return this;
  }

  static varIntBufNum(n: number): IsoBuf {
    if (n < 0) {
      throw new Error("varInt cannot be negative");
    }
    let buf: IsoBuf;
    if (n < 253) {
      buf = IsoBuf.alloc(1);
      buf.writeU8(n, 0);
    } else if (n < 0x10000) {
      buf = IsoBuf.alloc(1 + 2);
      buf.writeU8(253, 0);
      buf.writeU16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = IsoBuf.alloc(1 + 4);
      buf.writeU8(254, 0);
      buf.writeU32BE(n, 1);
    } else {
      const bn = BigInt(n);
      buf = IsoBuf.alloc(1 + 8);
      buf.writeU8(255, 0);
      buf.writeU64BE(bn, 1);
    }
    return buf;
  }

  static varIntBuf(bn: bigint): IsoBuf {
    if (bn < 0) {
      throw new Error("varInt cannot be negative");
    }
    let buf: IsoBuf;
    const n = Number(bn);
    if (n < 253) {
      buf = IsoBuf.alloc(1);
      buf.writeU8(n, 0);
    } else if (n < 0x10000) {
      buf = IsoBuf.alloc(1 + 2);
      buf.writeU8(253, 0);
      buf.writeU16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = IsoBuf.alloc(1 + 4);
      buf.writeU8(254, 0);
      buf.writeU32BE(n, 1);
    } else {
      buf = IsoBuf.alloc(1 + 8);
      buf.writeU8(255, 0);
      buf.writeU64BE(bn, 1);
    }
    return buf;
  }
}
