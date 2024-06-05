import { SysBuf } from "./buf.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";

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

  writeU128BE(u128: U128): this {
    const val1: bigint = u128.bn >> 64n;
    const val2: bigint = u128.bn & 0xffffffffffffffffn;
    const buf = SysBuf.alloc(16);
    buf.writeBigUInt64BE(val1, 0);
    buf.writeBigUInt64BE(val2, 8);
    this.write(buf);
    return this;
  }

  writeU256BE(u256: U256): this {
    const val1: bigint = u256.bn >> 192n;
    const val2: bigint = (u256.bn >> 128n) & 0xffffffffffffffffn;
    const val3: bigint = (u256.bn >> 64n) & 0xffffffffffffffffn;
    const val4: bigint = u256.bn & 0xffffffffffffffffn;
    const buf = SysBuf.alloc(32);
    buf.writeBigUInt64BE(val1, 0);
    buf.writeBigUInt64BE(val2, 8);
    buf.writeBigUInt64BE(val3, 16);
    buf.writeBigUInt64BE(val4, 24);
    this.write(buf);
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
