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
    let val: U8;
    try {
      val = U8.fromBEBuf(this.buf.subarray(this.pos, this.pos + 1));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 1;
    return val;
  }

  readU16BE(): U16 {
    let val: U16;
    try {
      val = U16.fromBEBuf(this.buf.subarray(this.pos, this.pos + 2));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 2;
    return val;
  }

  readU32BE(): U32 {
    let val: U32;
    try {
      val = U32.fromBEBuf(this.buf.subarray(this.pos, this.pos + 4));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 4;
    return val;
  }

  readU64BE(): U64 {
    let val: U64;
    try {
      val = U64.fromBEBuf(this.buf.subarray(this.pos, this.pos + 8));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 8;
    return val;
  }

  readU128BE(): U128 {
    let val: U128;
    try {
      val = U128.fromBEBuf(this.buf.subarray(this.pos, this.pos + 16));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 16;
    return val;
  }

  readU256BE(): U256 {
    let val: U256;
    try {
      val = U256.fromBEBuf(this.buf.subarray(this.pos, this.pos + 32));
    } catch (err: unknown) {
      throw new NotEnoughDataError();
    }
    this.pos += 32;
    return val;
  }

  readVarIntBuf(): SysBuf {
    const first = this.readU8().n;
    if (first === 0xfd) {
      const buf = this.read(2);
      if (buf.readUInt16BE(0) < 0xfd) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    }
    if (first === 0xfe) {
      const buf = this.read(4);
      if (buf.readUInt32BE(0) < 0x10000) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    }
    if (first === 0xff) {
      const buf = this.read(8);
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        throw new NonMinimalEncodingError();
      }
      return SysBuf.concat([SysBuf.from([first]), buf]);
    }
    return SysBuf.from([first]);
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
