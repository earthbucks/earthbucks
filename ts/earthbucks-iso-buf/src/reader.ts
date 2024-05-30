import { IsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { Option, Some, None } from "earthbucks-opt-res";
import {
  GenericError,
  NotEnoughDataError,
  NonMinimalEncodingError,
  InsufficientPrecisionError,
  IsoBufError,
} from "./iso-buf-error.js";

export class IsoBufReader {
  buf: IsoBuf;
  pos: number;

  constructor(buf: IsoBuf) {
    this.buf = buf;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.buf.length;
  }

  read(len: number): Result<IsoBuf, IsoBufError> {
    if (this.pos + len > this.buf.length) {
      return Err(new NotEnoughDataError(None));
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = IsoBuf.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readRemainder(): IsoBuf {
    return this.read(this.buf.length - this.pos).unwrap();
  }

  readU8(): Result<number, IsoBufError> {
    let val: number;
    const res = this.buf.readU8(this.pos);
    if (res.err) {
      return Err(new NotEnoughDataError(Some(res.val)));
    }
    val = res.unwrap();
    this.pos += 1;
    return Ok(val);
  }

  readU16BE(): Result<number, IsoBufError> {
    let val: number;
    const res = this.buf.readU16BE(this.pos);
    if (res.err) {
      return Err(new NotEnoughDataError(Some(res.val)));
    }
    val = res.unwrap();
    this.pos += 2;
    return Ok(val);
  }

  readU32BE(): Result<number, IsoBufError> {
    let val: number;
    const res = this.buf.readU32BE(this.pos);
    if (res.err) {
      return Err(new NotEnoughDataError(Some(res.val)));
    }
    val = res.unwrap();
    this.pos += 4;
    return Ok(val);
  }

  readU64BE(): Result<bigint, IsoBufError> {
    let val: bigint;
    const res = this.buf.readU64BE(this.pos);
    if (res.err) {
      return Err(new NotEnoughDataError(Some(res.val)));
    }
    val = res.unwrap();
    this.pos += 8;
    return Ok(val);
  }

  readVarIntBuf(): Result<IsoBuf, GenericError> {
    const res = this.readU8();
    if (res.err) {
      return Err(new NotEnoughDataError(Some(res.val)));
    }
    const first = res.unwrap();
    if (first === 0xfd) {
      const res = this.read(2);
      if (res.err) {
        return Err(new NotEnoughDataError(Some(res.val)));
      }
      const buf = res.unwrap();
      if (buf.readU16BE(0).unwrap() < 0xfd) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(IsoBuf.concat([IsoBuf.from(new Uint8Array([first])), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4);
      if (res.err) {
        return Err(new NotEnoughDataError(Some(res.val)));
      }
      const buf = res.unwrap();
      if (buf.readU32BE(0).unwrap() < 0x10000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(IsoBuf.concat([IsoBuf.from(new Uint8Array([first])), buf]));
    } else if (first === 0xff) {
      const res = this.read(8);
      if (res.err) {
        return Err(new NotEnoughDataError(Some(res.val)));
      }
      const buf = res.unwrap();
      const bn = buf.readU64BE(0).unwrap();
      if (bn < 0x100000000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(IsoBuf.concat([IsoBuf.from(new Uint8Array([first])), buf]));
    } else {
      return Ok(IsoBuf.from(new Uint8Array([first])));
    }
  }

  readVarInt(): Result<bigint, GenericError> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return Err(res.val);
    }
    const buf = res.unwrap();
    const first = buf.readU8(0).unwrap();
    let value: bigint;
    switch (first) {
      case 0xfd:
        value = BigInt(buf.readU16BE(1).unwrap());
        break;
      case 0xfe:
        value = BigInt(buf.readU32BE(1).unwrap());
        break;
      case 0xff:
        value = buf.readU64BE(1).unwrap();
        break;
      default:
        value = BigInt(first);
        break;
    }
    return Ok(value);
  }

  readVarIntNum(): Result<number, GenericError> {
    const value = this.readVarInt();
    if (value.err) {
      return Err(value.val);
    }
    if (value.unwrap() > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Err(new InsufficientPrecisionError(None));
    }
    return Ok(Number(value.unwrap()));
  }
}
