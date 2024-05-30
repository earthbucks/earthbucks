import { IsoBuf } from "./iso-buf";

export class IsoBufWriter {
  bufs: IsoBuf[];

  constructor(bufs?: IsoBuf[]) {
    this.bufs = bufs ? bufs.map((arr) => IsoBuf.from(arr)) : [];
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

  writeUInt8(n: number): this {
    const buf = IsoBuf.alloc(1);
    buf.writeUInt8(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeUInt16BE(n: number): this {
    const buf = IsoBuf.alloc(2);
    buf.writeUInt16BE(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeUInt32BE(n: number): this {
    const buf = IsoBuf.alloc(4);
    buf.writeUInt32BE(n, 0);
    this.writeIsoBuf(buf);
    return this;
  }

  writeUInt64BE(bn: bigint): this {
    const buf = IsoBuf.alloc(8);
    buf.writeBigInt64BE(bn);
    this.writeIsoBuf(buf);
    return this;
  }

  writeVarIntNum(n: number): this {
    const buf = IsoBufWriter.varIntBufNum(n);
    this.writeIsoBuf(buf);
    return this;
  }

  writeVarInt(bn: bigint): this {
    const buf = IsoBufWriter.varIntBuf(bn);
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
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = IsoBuf.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = IsoBuf.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      const bn = BigInt(n);
      buf = IsoBuf.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeBigInt64BE(bn, 1);
    }
    return buf;
  }

  static varIntBuf(bn: bigint): IsoBuf {
    if (bn < 0n) {
      throw new Error("varInt cannot be negative");
    }
    let buf: IsoBuf;
    const n = Number(bn);
    if (n < 253) {
      buf = IsoBuf.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = IsoBuf.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = IsoBuf.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      buf = IsoBuf.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeBigInt64BE(bn, 1);
    }
    return buf;
  }
}
