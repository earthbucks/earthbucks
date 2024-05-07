import { Buffer } from "buffer";
import { Err, Ok, Result } from "ts-results";

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

  readBuffer(len: number): Result<Buffer, string> {
    if (this.pos + len > this.buf.length) {
      return Err("readBuffer: Not enough bytes left in the buffer to read");
    }
    const buf = this.buf.subarray(this.pos, this.pos + len);
    const newBuf = Buffer.alloc(len);
    newBuf.set(buf);
    this.pos += len;
    return Ok(newBuf);
  }

  readRemainder(): Result<Buffer, string> {
    return this.readBuffer(this.buf.length - this.pos);
  }

  readUInt8(): Result<number, string> {
    if (this.pos + 1 > this.buf.length) {
      return Err("readUint8: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readUInt8(this.pos);
    this.pos += 1;
    return Ok(val);
  }

  readInt8(): Result<number, string> {
    if (this.pos + 1 > this.buf.length) {
      return Err("readInt8: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readInt8(this.pos);
    this.pos += 1;
    return Ok(val);
  }

  readUInt16BE(): Result<number, string> {
    if (this.pos + 2 > this.buf.length) {
      return Err("readUInt16BE: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return Ok(val);
  }

  readInt16BE(): Result<number, string> {
    if (this.pos + 2 > this.buf.length) {
      return Err("readInt16BE: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readInt16BE(this.pos);
    this.pos += 2;
    return Ok(val);
  }

  readUInt32BE(): Result<number, string> {
    if (this.pos + 4 > this.buf.length) {
      return Err("readUInt32BE: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return Ok(val);
  }

  readInt32BE(): Result<number, string> {
    if (this.pos + 4 > this.buf.length) {
      return Err("readInt32BE: Not enough bytes left in the buffer to read");
    }
    const val = this.buf.readInt32BE(this.pos);
    this.pos += 4;
    return Ok(val);
  }

  readUInt64BE(): Result<bigint, string> {
    if (this.pos + 8 > this.buf.length) {
      return Err(
        "readUInt64BEBigInt: Not enough bytes left in the buffer to read",
      );
    }
    const high = this.buf.readUInt32BE(this.pos);
    const low = this.buf.readUInt32BE(this.pos + 4);
    const bn = BigInt(high) * BigInt(0x100000000) + BigInt(low);
    this.pos += 8;
    return Ok(bn);
  }

  readVarIntBuf(): Result<Buffer, string> {
    if (this.eof()) {
      return Err("readVarIntBuf: Not enough bytes left in the buffer to read");
    }
    const first = this.buf.readUInt8(this.pos);
    if (first === 0xfd) {
      const res = this.readBuffer(1 + 2);
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt16BE(1) < 0xfd) {
        return Err("Non-minimal varint encoding 1");
      }
      return Ok(buf);
    } else if (first === 0xfe) {
      const res = this.readBuffer(1 + 4);
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      if (buf.readUInt32BE(1) < 0x10000) {
        return Err("Non-minimal varint encoding 2");
      }
      return Ok(buf);
    } else if (first === 0xff) {
      const res = this.readBuffer(1 + 8);
      if (res.err) {
        return res;
      }
      const buf = res.unwrap();
      const high = buf.readUInt32BE(1);
      const low = buf.readUInt32BE(5);
      if (high === 0 && low < 0x100000000) {
        return Err("Non-minimal varint encoding 3");
      }
      return Ok(buf);
    } else {
      return this.readBuffer(1);
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
        const high = buf.readUInt32BE(1);
        const low = buf.readUInt32BE(5);
        value = BigInt(high) * BigInt(0x100000000) + BigInt(low);
        break;
      default:
        value = BigInt(first);
        break;
    }
    return Ok(value);
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
        const high = buf.readUInt32BE(1);
        const low = buf.readUInt32BE(5);
        const bigValue = BigInt(high) * BigInt(0x100000000) + BigInt(low);
        if (bigValue > BigInt(Number.MAX_SAFE_INTEGER)) {
          return Err("Number too large to retain precision - use readVarInt");
        }
        value = Number(bigValue);
        break;
      default:
        value = first;
        break;
    }
    return Ok(value);
  }
}
