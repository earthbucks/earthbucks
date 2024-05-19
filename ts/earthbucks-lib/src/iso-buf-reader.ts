import { Buffer } from "buffer";
import { Err, Ok, Result } from "./ts-results/result";

abstract class IsoBufReaderError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toString(): string {
    return `IsoBufReader::${this.constructor.name} (${this.code}): ${this.message}`;
  }
}

class ReadError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadU8Error extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadU16BEError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadU32BEError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadU64BEError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadVarIntBufError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadVarIntError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
  }
}

class ReadVarIntNumError extends IsoBufReaderError {
  constructor(code: number, message: string) {
    super(code, message);
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
      return Err(
        new ReadError(1, "not enough bytes left in the buffer to read"),
      );
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
    } catch (err) {
      return Err(new ReadU8Error(1, `${err}`));
    }
    this.pos += 1;
    return Ok(val);
  }

  readU16BE(): Result<number, IsoBufReaderError> {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      return Err(new ReadU16BEError(1, `${err}`));
    }
    this.pos += 2;
    return Ok(val);
  }

  readU32BE(): Result<number, IsoBufReaderError> {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      return Err(new ReadU32BEError(1, `${err}`));
    }
    this.pos += 4;
    return Ok(val);
  }

  readU64BE(): Result<bigint, IsoBufReaderError> {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      return Err(new ReadU64BEError(1, `${err}`));
    }
    this.pos += 8;
    return Ok(val);
  }

  readVarIntBuf(): Result<Buffer, IsoBufReaderError> {
    const res = this.readU8().mapErr(
      (err) => new ReadVarIntBufError(1, `${err}`),
    );
    if (res.err) {
      return res;
    }
    const first = res.unwrap();
    if (first === 0xfd) {
      const res = this.read(2).mapErr(
        (err) => new ReadVarIntBufError(2, `${err}`),
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(0) < 0xfd) {
        return Err(new ReadVarIntBufError(3, "non-minimal varint encoding"));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4).mapErr(
        (err) => new ReadVarIntBufError(4, `${err}`),
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return Err(new ReadVarIntBufError(5, "non-minimal varint encoding"));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.read(8).mapErr(
        (err) => new ReadVarIntBufError(6, `${err}`),
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return Err(new ReadVarIntBufError(7, "non-minimal varint encoding"));
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else {
      return Ok(Buffer.from([first]));
    }
  }

  readVarInt(): Result<bigint, IsoBufReaderError> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return Err(
        new ReadVarIntError(1, `unable to read varint buf: ${res.val.message}`),
      );
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
      return Err(
        new ReadVarIntNumError(
          1,
          `unable to read varint: ${value.val.message}`,
        ),
      );
    }
    if (value.unwrap() > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Err(
        new ReadVarIntNumError(
          2,
          "Number too large to retain precision - use readVarInt",
        ),
      );
    }
    return Ok(Number(value.unwrap()));
  }
}
