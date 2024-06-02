import { SysBuf } from "./iso-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";

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

  writeU8(u8: U8): this {
    const buf = SysBuf.alloc(1);
    buf.writeUInt8(u8.n, 0);
    this.write(buf);
    return this;
  }

  writeU16BE(u16: U16): this {
    const buf = SysBuf.alloc(2);
    buf.writeUInt16BE(u16.n, 0);
    this.write(buf);
    return this;
  }

  writeU32BE(u32: U32): this {
    const buf = SysBuf.alloc(4);
    buf.writeUInt32BE(u32.n, 0);
    this.write(buf);
    return this;
  }

  writeU64BE(u64: U64): this {
    const buf = SysBuf.alloc(8);
    buf.writeBigInt64BE(u64.bn);
    this.write(buf);
    return this;
  }

  writeVarInt(u64: U64): this {
    const buf = IsoBufWriter.varIntBuf(u64);
    this.write(buf);
    return this;
  }

  static varIntBuf(bn: U64): SysBuf {
    let buf: SysBuf;
    const n = bn.n;
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
      buf.writeBigInt64BE(bn.bn, 1);
    }
    return buf;
  }
}
