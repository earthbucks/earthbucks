import { SysBuf } from "./buf.js";
import type { U8, U16, U32, U64, U128, U256 } from "./numbers.js";

export class BufWriter {
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

  toBuf(): SysBuf {
    return SysBuf.concat(this.bufs);
  }

  write(buf: SysBuf): this {
    this.bufs.push(buf);
    return this;
  }

  writeU8(u8: U8): this {
    this.write(u8.toBEBuf());
    return this;
  }

  writeU16BE(u16: U16): this {
    this.write(u16.toBEBuf());
    return this;
  }

  writeU32BE(u32: U32): this {
    this.write(u32.toBEBuf());
    return this;
  }

  writeU64BE(u64: U64): this {
    this.write(u64.toBEBuf());
    return this;
  }

  writeU128BE(u128: U128): this {
    this.write(u128.toBEBuf());
    return this;
  }

  writeU256BE(u256: U256): this {
    this.write(u256.toBEBuf());
    return this;
  }

  writeVarInt(u64: U64): this {
    const buf = BufWriter.varIntBuf(u64);
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
