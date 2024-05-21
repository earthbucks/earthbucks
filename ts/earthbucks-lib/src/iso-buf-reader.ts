import { Buffer } from "buffer";
import { Result, Ok, Err } from "./ts-results/result";
import { Option, Some, None } from "./ts-results/option";

export abstract class IsoBufReaderError extends Error {
  constructor() {
    super();
  }
}

export class InsufficientLengthError extends IsoBufReaderError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `not enough bytes in the buffer to read`;
  }
}

export class NonMinimalEncodingError extends IsoBufReaderError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `non-minimal varint encoding`;
  }
}

export class InsufficientPrecisionError extends IsoBufReaderError {
  constructor(public source: Option<Error>) {
    super();
  }

  toString(): string {
    return `number too large to retain precision`;
  }
}

export default class IsoBufReader {
  buf: Buffer;
  pos: number;

  constructor(buf: Buffer) {
    this.buf = buf;
    this.pos = 0;
  }

  eof(): boolean {
    return this.pos >= this.buf.length;
  }

  read(len: number): Result<Buffer, IsoBufReaderError> {
    if (this.pos + len > this.buf.length) {
      return Err(new InsufficientLengthError(None));
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = Buffer.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readRemainder(): Buffer {
    return this.read(this.buf.length - this.pos).unwrap();
  }

  readU8(): Result<number, IsoBufReaderError> {
    let val: number;
    try {
      val = this.buf.readUInt8(this.pos);
    } catch (err: unknown) {
      return Err(new InsufficientLengthError(Some(err as Error)));
    }
    this.pos += 1;
    return Ok(val);
  }

  readU16BE(): Result<number, IsoBufReaderError> {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      return Err(new InsufficientLengthError(Some(err as Error)));
    }
    this.pos += 2;
    return Ok(val);
  }

  readU32BE(): Result<number, IsoBufReaderError> {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      return Err(new InsufficientLengthError(Some(err as Error)));
    }
    this.pos += 4;
    return Ok(val);
  }

  readU64BE(): Result<bigint, IsoBufReaderError> {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      return Err(new InsufficientLengthError(Some(err as Error)));
    }
    this.pos += 8;
    return Ok(val);
  }

  readVarIntBuf(): Result<Buffer, IsoBufReaderError> {
    const res = this.readU8();
    if (res.err) {
      return Err(new InsufficientLengthError(Some(res.val)));
    }
    const first = res.unwrap();
    if (first === 0xfd) {
      const res = this.read(2);
      if (res.err) {
        return Err(new InsufficientLengthError(Some(res.val)));
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(0) < 0xfd) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4);
      if (res.err) {
        return Err(new InsufficientLengthError(Some(res.val)));
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.read(8);
      if (res.err) {
        return Err(new InsufficientLengthError(Some(res.val)));
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return Err(new NonMinimalEncodingError(None));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else {
      return Ok(Buffer.from([first]));
    }
  }

  readVarInt(): Result<bigint, IsoBufReaderError> {
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

  readVarIntNum(): Result<number, IsoBufReaderError> {
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
