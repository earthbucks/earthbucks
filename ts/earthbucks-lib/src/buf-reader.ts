import { SysBuf, EbxBuf, FixedBuf } from "./buf.js";
import {
  EbxError,
  NotEnoughDataError,
  NonMinimalEncodingError,
  InsufficientPrecisionError,
} from "./error.js";
import { U8, U16, U32, U64, U128, U256 } from "./numbers.js";

export class BufReader {
  buf: SysBuf;
  pos: number;

  constructor(buf: SysBuf) {
    this.buf = buf;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.buf.length;
  }

  read(len: number): SysBuf {
    if (this.pos + len > this.buf.length) {
      throw new NotEnoughDataError();
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = SysBuf.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return newBuf;
  }

  readFixed<N extends number>(len: N): FixedBuf<N> {
    const isoBuf = this.read(len);
    return FixedBuf.fromBuf(len, isoBuf) as FixedBuf<N>;
  }

  readRemainder(): SysBuf {
    return this.read(this.buf.length - this.pos);
  }

  readU8(): U8 {
    let val: number;
    try {
      val = this.buf.readUInt8(this.pos);
    } catch (err: unknown) {
      throw new NotEnoughDataError(err as Error);
    }
    this.pos += 1;
    return new U8(BigInt(val));
  }

  readU16BE(): U16 {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      throw new NotEnoughDataError(err as Error);
    }
    this.pos += 2;
    return new U16(BigInt(val));
  }

  readU32BE(): U32 {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      throw new NotEnoughDataError(err as Error);
    }
    this.pos += 4;
    return new U32(BigInt(val));
  }

  readU64BE(): U64 {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      throw new NotEnoughDataError(err as Error);
    }
    this.pos += 8;
    return new U64(val);
  }

  readU128BE(): U128 {
    const buf = this.read(16);
    let val1: bigint;
    let val2: bigint;
    try {
      val1 = buf.readBigUInt64BE(0);
      val2 = buf.readBigUInt64BE(8);
    } catch (err) {
      throw new NotEnoughDataError(err as Error);
    }
    const val = (val1 << 64n) + val2;
    return new U128(val);
  }

  readU256BE(): U256 {
    const buf = this.read(32);
    let val1: bigint;
    let val2: bigint;
    let val3: bigint;
    let val4: bigint;
    try {
      val1 = buf.readBigUInt64BE(0);
      val2 = buf.readBigUInt64BE(8);
      val3 = buf.readBigUInt64BE(16);
      val4 = buf.readBigUInt64BE(24);
    } catch (err) {
      throw new NotEnoughDataError(err as Error);
    }
    const val = (val1 << 192n) + (val2 << 128n) + (val3 << 64n) + val4;
    return new U256(val);
  }

  readVarIntBuf(): SysBuf {
    const first = this.readU8().n;
    if (first === 0xfd) {
      const buf = this.read(2);
      if (buf.readUInt16BE(0) < 0xfd) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    } else if (first === 0xfe) {
      const buf = this.read(4);
      if (buf.readUInt32BE(0) < 0x10000) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    } else if (first === 0xff) {
      const buf = this.read(8);
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    } else {
      return SysBuf.from([first]);
    }
  }

  readVarInt(): U64 {
    const buf = this.readVarIntBuf();
    const first = buf.readUInt8(0);
    let value: bigint;
    switch (first) {
      case 0xfd:
        value = BigInt(buf.readUInt16BE(1));
        break;
      case 0xfe:
        value = BigInt(buf.readUInt32BE(1));
        break;
      case 0xff:
        value = buf.readBigUInt64BE(1);
        break;
      default:
        value = BigInt(first);
        break;
    }
    return new U64(value);
  }
}
