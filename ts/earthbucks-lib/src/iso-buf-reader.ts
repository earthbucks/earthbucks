import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import {
  EbxError,
  NotEnoughDataError,
  NonMinimalEncodingError,
  InsufficientPrecisionError,
} from "./ebx-error.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class IsoBufReader {
  buf: SysBuf;
  pos: number;

  constructor(buf: SysBuf) {
    this.buf = buf;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.buf.length;
  }

  read(len: number): Result<SysBuf, EbxError> {
    if (this.pos + len > this.buf.length) {
      return Err(new NotEnoughDataError());
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = SysBuf.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readFixed<N extends number>(len: N): Result<FixedIsoBuf<N>, EbxError> {
    const res = this.read(len);
    if (res.err) {
      return Err(res.val);
    }
    return FixedIsoBuf.fromBuf(len, res.unwrap()) as Result<
      FixedIsoBuf<N>,
      EbxError
    >;
  }

  readRemainder(): SysBuf {
    return this.read(this.buf.length - this.pos).unwrap();
  }

  readU8(): Result<U8, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt8(this.pos);
    } catch (err: unknown) {
      return Err(new NotEnoughDataError(err as Error));
    }
    this.pos += 1;
    return Ok(new U8(BigInt(val)));
  }

  readU16BE(): Result<U16, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(err as Error));
    }
    this.pos += 2;
    return Ok(new U16(BigInt(val)));
  }

  readU32BE(): Result<U32, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(err as Error));
    }
    this.pos += 4;
    return Ok(new U32(BigInt(val)));
  }

  readU64BE(): Result<U64, EbxError> {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(err as Error));
    }
    this.pos += 8;
    return Ok(new U64(val));
  }

  readVarIntBuf(): Result<SysBuf, EbxError> {
    const res = this.readU8();
    if (res.err) {
      return Err(new NotEnoughDataError(res.val));
    }
    const first = res.unwrap().n;
    if (first === 0xfd) {
      const res = this.read(2);
      if (res.err) {
        return Err(new NotEnoughDataError(res.val));
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(0) < 0xfd) {
        return Err(new NonMinimalEncodingError());
      }
      return Ok(SysBuf.concat([SysBuf.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4);
      if (res.err) {
        return Err(new NotEnoughDataError(res.val));
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return Err(new NonMinimalEncodingError());
      }
      return Ok(SysBuf.concat([SysBuf.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.read(8);
      if (res.err) {
        return Err(new NotEnoughDataError(res.val));
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return Err(new NonMinimalEncodingError());
      }
      return Ok(SysBuf.concat([SysBuf.from([first]), buf]));
    } else {
      return Ok(SysBuf.from([first]));
    }
  }

  readVarInt(): Result<U64, EbxError> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
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
    return Ok(new U64(value));
  }
}
