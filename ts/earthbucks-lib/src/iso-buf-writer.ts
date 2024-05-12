import { Buffer } from "buffer";

export default class IsoBufWriter {
  bufs: Buffer[];

  constructor(bufs?: Buffer[]) {
    this.bufs = bufs ? bufs.map((arr) => Buffer.from(arr)) : [];
  }

  getLength(): number {
    let len = 0;
    for (const buf of this.bufs) {
      len += buf.length;
    }
    return len;
  }

  toIsoBuf(): Buffer {
    return Buffer.concat(this.bufs);
  }

  writeBuffer(buf: Buffer): this {
    this.bufs.push(buf);
    return this;
  }

  writeUInt8(n: number): this {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(n, 0);
    this.writeBuffer(buf);
    return this;
  }

  writeUInt16BE(n: number): this {
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(n, 0);
    this.writeBuffer(buf);
    return this;
  }

  writeUInt32BE(n: number): this {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(n, 0);
    this.writeBuffer(buf);
    return this;
  }

  writeUInt64BE(bn: bigint): this {
    const buf = Buffer.alloc(8);
    buf.writeBigInt64BE(bn);
    this.writeBuffer(buf);
    return this;
  }

  writeVarIntNum(n: number): this {
    const buf = IsoBufWriter.varIntBufNum(n);
    this.writeBuffer(buf);
    return this;
  }

  writeVarInt(bn: bigint): this {
    const buf = IsoBufWriter.varIntBuf(bn);
    this.writeBuffer(buf);
    return this;
  }

  static varIntBufNum(n: number): Buffer {
    let buf: Buffer;
    if (n < 253) {
      buf = Buffer.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      buf = Buffer.alloc(1 + 8);
      buf.writeUInt8(255, 0);
      buf.writeInt32BE(n & -1, 1);
      buf.writeUInt32BE(Math.floor(n / 0x100000000), 5);
    }
    return buf;
  }

  static varIntBuf(bn: bigint): Buffer {
    let buf: Buffer;
    const n = Number(bn);
    if (n < 253) {
      buf = Buffer.alloc(1);
      buf.writeUInt8(n, 0);
    } else if (n < 0x10000) {
      buf = Buffer.alloc(1 + 2);
      buf.writeUInt8(253, 0);
      buf.writeUInt16BE(n, 1);
    } else if (n < 0x100000000) {
      buf = Buffer.alloc(1 + 4);
      buf.writeUInt8(254, 0);
      buf.writeUInt32BE(n, 1);
    } else {
      const bw = new IsoBufWriter();
      bw.writeUInt8(255);
      bw.writeUInt64BE(bn);
      buf = bw.toIsoBuf();
    }
    return buf;
  }
}
