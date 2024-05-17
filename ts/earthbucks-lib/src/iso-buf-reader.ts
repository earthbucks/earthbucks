import { Buffer } from "buffer";
import { Err, Ok, Result } from "./ts-results/result";

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

  read(len: number): Result<Buffer, string> {
    if (this.pos + len > this.buf.length) {
      return Err("read: not enough bytes left in the buffer to read");
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = Buffer.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readRemainder(): Result<Buffer, string> {
    return this.read(this.buf.length - this.pos);
  }

  readU8(): Result<number, string> {
    let val: number;
    try {
      val = this.buf.readUInt8(this.pos);
    } catch (err) {
      return Err("read_u8: unable to read 1 byte: " + err);
    }
    this.pos += 1;
    return Ok(val);
  }

  readU16BE(): Result<number, string> {
    let val: number;
    try {
      val = this.buf.readUInt16BE(this.pos);
    } catch (err) {
      return Err("read_u16_be: unable to read 2 bytes: " + err);
    }
    this.pos += 2;
    return Ok(val);
  }

  readU32BE(): Result<number, string> {
    let val: number;
    try {
      val = this.buf.readUInt32BE(this.pos);
    } catch (err) {
      return Err("read_u32_be: unable to read 4 bytes: " + err);
    }
    this.pos += 4;
    return Ok(val);
  }

  readU64BE(): Result<bigint, string> {
    let val: bigint;
    try {
      val = this.buf.readBigUInt64BE(this.pos);
    } catch (err) {
      return Err("read_u64_be: unable to read 8 bytes: " + err);
    }
    this.pos += 8;
    return Ok(val);
  }

  readVarIntBuf(): Result<Buffer, string> {
    const res = this.readU8().mapErr(
      (err) => `read_var_int_buf 1: unable to read 1 byte: ${err}`,
    );
    if (res.err) {
      return res;
    }
    const first = res.unwrap();
    if (first === 0xfd) {
      const res = this.read(2).mapErr(
        (err) => `read_var_int_buf 2: unable to read 2 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(0) < 0xfd) {
        return Err("read_var_int_buf 3: non-minimal varint encoding");
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.read(4).mapErr(
        (err) => `read_var_int_buf 4: unable to read 4 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return Err("read_var_int_buf 5: non-minimal varint encoding");
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.read(8).mapErr(
        (err) => `read_var_int_buf 6: unable to read 8 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return Err("read_var_int_buf 7: non-minimal varint encoding");
      }
      return Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else {
      return Ok(Buffer.from([first]));
    }
  }

  readVarInt(): Result<bigint, string> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return res.mapErr(
        (err) => `read_var_int 1: unable to read varint buffer: ${err}`,
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

  readVarIntNum(): Result<number, string> {
    const value = this.readVarInt();
    if (value.err) {
      return value;
    }
    if (value.unwrap() > BigInt(Number.MAX_SAFE_INTEGER)) {
      return Err("Number too large to retain precision - use readVarInt");
    }
    return Ok(Number(value.unwrap()));
  }
}
