import { EbxBuffer } from "./ebx-buffer";
import { Result, Ok, Err } from "earthbucks-opt-res";
import { Option, Some, None } from "earthbucks-opt-res";
import {
  EbxError,
  NotEnoughDataError,
  NonMinimalEncodingError,
  InsufficientPrecisionError,
} from "./ebx-error.js";

export class IsoBufReader {
  buf: EbxBuffer;
  pos: number;

  constructor(buf: EbxBuffer) {
    this.buf = buf;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.buf.length;
  }

  read(len: number): Result<EbxBuffer, EbxError> {
    if (this.pos + len > this.buf.length) {
      return Err(new NotEnoughDataError(None));
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = EbxBuffer.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readRemainder(): EbxBuffer {
    return this.read(this.buf.length - this.pos).unwrap();
  }

  readU8(): Result<number, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt8(this.pos);
    } catch (err: unknown) {
      return Err(new NotEnoughDataError(Some(err as Error)));
    }
    this.pos += 1;
    return Ok(val);
  }

  readU16BE(): Result<number, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(Some(err as Error)));
    }
    this.pos += 2;
    return Ok(val);
  }

  readU32BE(): Result<number, EbxError> {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(Some(err as Error)));
    }
    this.pos += 4;
    return Ok(val);
  }

  readU64BE(): Result<bigint, EbxError> {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      return Err(new NotEnoughDataError(Some(err as Error)));
    }
    this.pos += 8;
    return Ok(val);
  }

  readVarIntBuf(): Result<EbxBuffer, EbxError> {
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
      if (buf.readUInt16BE(0) < 0xfd) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(EbxBuffer.concat([EbxBuffer.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4);
      if (res.err) {
        return Err(new NotEnoughDataError(Some(res.val)));
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(EbxBuffer.concat([EbxBuffer.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.read(8);
      if (res.err) {
        return Err(new NotEnoughDataError(Some(res.val)));
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(EbxBuffer.concat([EbxBuffer.from([first]), buf]));
    } else {
      return Ok(EbxBuffer.from([first]));
    }
  }

  readVarInt(): Result<bigint, EbxError> {
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
    return Ok(value);
  }

  readVarIntNum(): Result<number, EbxError> {
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
