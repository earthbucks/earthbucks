import { SysBuf } from "./iso-buf.js";

export class IsoBufWriter {
  bufs: SysBuf[];

  constructor(bufs?: SysBuf[]) {
    this.bufs = bufs ? bufs.map((arr) => SysBuf.from(arr)) : [];
  }

  getLength(): number {
    let len = 0;
    for (const buf of this.bufs) {
      len += buf.length;
    }
    return len;
  }

  toIsoBuf(): SysBuf {
    return SysBuf.concat(this.bufs);
  }

  write(buf: SysBuf): this {
    this.bufs.push(buf);
    return this;
  }

  writeU8(n: number): this {
    const buf = SysBuf.alloc(1);
    buf.writeUInt8(n, 0);
    this.write(buf);
    return this;
  }

  writeU16BE(n: number): this {
    const buf = SysBuf.alloc(2);
    buf.writeUInt16BE(n, 0);
    this.write(buf);
    return this;
  }

  writeU32BE(n: number): this {
    const buf = SysBuf.alloc(4);
    buf.writeUInt32BE(n, 0);
    this.write(buf);
    return this;
  }

  writeU64BE(bn: bigint): this {
    const buf = SysBuf.alloc(8);
    buf.writeBigInt64BE(bn);
    this.write(buf);
    return this;
  }

  writeVarIntNum(n: number): this {
    const buf = IsoBufWriter.varIntBufNum(n);
    this.write(buf);
    return this;
  }

  writeVarInt(bn: bigint): this {
    const buf = IsoBufWriter.varIntBuf(bn);
    this.write(buf);
    return this;
  }

  static varIntBufNum(n: number): SysBuf {
    if (n < 0) {
      throw new Error("varInt cannot be negative");
    }
    let buf: SysBuf;
    if (n < 253) {
      buf = SysBuf.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = SysBuf.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = SysBuf.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      const bn = BigInt(n);
      buf = SysBuf.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeBigInt64BE(bn, 1);
    }
    return buf;
  }

  static varIntBuf(bn: bigint): SysBuf {
    if (bn < 0n) {
      throw new Error("varInt cannot be negative");
    }
    let buf: SysBuf;
    const n = Number(bn);
    if (n < 253) {
      buf = SysBuf.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = SysBuf.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = SysBuf.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      buf = SysBuf.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeBigInt64BE(bn, 1);
    }
    return buf;
  }
}
