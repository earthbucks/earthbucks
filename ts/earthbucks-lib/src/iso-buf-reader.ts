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

  readIsoBuf(len: number): Result<Buffer, string> {
    if (this.pos + len > this.buf.length) {
      return new Err("readBuffer: Not enough bytes left in the buffer to read");
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = Buffer.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return new Ok(newBuf);
  }

  readRemainder(): Result<Buffer, string> {
    return this.readIsoBuf(this.buf.length - this.pos);
  }

  readUInt8(): Result<number, string> {
    if (this.pos + 1 > this.buf.length) {
      return new Err("readUint8: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readUInt8(this.pos);
    this.pos += 1;
    return new Ok(val);
  }

  readUInt16BE(): Result<number, string> {
    if (this.pos + 2 > this.buf.length) {
      return new Err(
        "readUInt16BE: Not enough bytes left in the buffer to read",
      );
    }
    const val = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return new Ok(val);
  }

  readUInt32BE(): Result<number, string> {
    if (this.pos + 4 > this.buf.length) {
      return new Err(
        "readUInt32BE: Not enough bytes left in the buffer to read",
      );
    }
    const val = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return new Ok(val);
  }

  readUInt64BE(): Result<bigint, string> {
    if (this.pos + 8 > this.buf.length) {
      return new Err(
        "readUInt64BEBigInt: Not enough bytes left in the buffer to read",
      );
    }
    const bn = this.buf.readBigUInt64BE(this.pos);
    this.pos += 8;
    return new Ok(bn);
  }

  readVarIntBuf(): Result<Buffer, string> {
    const res = this.readUInt8().mapErr(
      (err) => `read_var_int_buf 1: could not read first byte: ${err}`,
    );
    if (res.err) {
      return res;
    }
    const first = res.unwrap();
    if (first === 0xfd) {
      const res = this.readIsoBuf(2).mapErr(
        (err) => `read_var_int_buf 2: could not read 2 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(0) < 0xfd) {
        return new Err("read_var_int_buf 2: non-minimal varint encoding 1");
      }
      return new Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xfe) {
      const res = this.readIsoBuf(4).mapErr(
        (err) => `read_var_int_buf 3: could not read 4 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(0) < 0x10000) {
        return new Err("read_var_int_buf 3: non-minimal varint encoding 2");
      }
      return new Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else if (first === 0xff) {
      const res = this.readIsoBuf(8).mapErr(
        (err) => `read_var_int_buf 4: could not read 8 bytes: ${err}`,
      );
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      const bn = buf.readBigUInt64BE(0);
      if (bn < 0x100000000) {
        return new Err("read_var_int_buf 4: non-minimal varint encoding 3");
      }
      return new Ok(Buffer.concat([Buffer.from([first]), buf]));
    } else {
      return new Ok(Buffer.from([first]));
    }
  }

  readVarInt(): Result<bigint, string> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return res;
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
    return new Ok(value);
  }

  readVarIntNum(): Result<number, string> {
    const res = this.readVarIntBuf();
    if (res.err) {
      return res;
    }
    const buf = res.unwrap();
    const first = buf.readUInt8(0);
    let value: number;
    switch (first) {
      case 0xfd:
        value = buf.readUInt16BE(1);
        break;
      case 0xfe:
        value = buf.readUInt32BE(1);
        break;
      case 0xff:
        const bigValue = buf.readBigUInt64BE(1);
        if (bigValue > BigInt(Number.MAX_SAFE_INTEGER)) {
          return new Err(
            "Number too large to retain precision - use readVarInt",
          );
        }
        value = Number(bigValue);
        break;
      default:
        value = first;
        break;
    }
    return new Ok(value);
  }
}
