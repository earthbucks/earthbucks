import { Result, Ok, Err } from "earthbucks-opt-res";
import { Option, Some, None } from "earthbucks-opt-res";
import {
  InvalidEncodingError,
  InvalidHexError,
  IsoBufError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./iso-buf-error.js";

export function isValidHex(hex: string) {
  if (!/^[0-9a-f]*$/.test(hex) || hex.length % 2 !== 0) {
    return false;
  }
  return true;
}

export class IsoBuf extends Uint8Array {
  static alloc(size: number): IsoBuf {
    return new IsoBuf(size);
  }

  readU8(offset: number): Result<number, IsoBufError> {
    if (offset >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(this[offset]);
  }

  writeU8(n: number, offset: number): Result<void, IsoBufError> {
    if (offset >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    this[offset] = n;
    return Ok(undefined);
  }

  readU16BE(offset: number): Result<number, IsoBufError> {
    if (offset + 1 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    const view = new DataView(this.buffer);
    return Ok(view.getUint16(offset, false));
  }

  writeU16BE(n: number, offset: number): Result<void, IsoBufError> {
    if (offset + 1 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    const view = new DataView(this.buffer);
    view.setUint16(offset, n, false);
    return Ok(undefined);
  }

  readU32BE(offset: number): Result<number, IsoBufError> {
    if (offset + 3 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    const view = new DataView(this.buffer);
    return Ok(view.getUint32(offset, false));
  }

  writeU32BE(n: number, offset: number): Result<void, IsoBufError> {
    if (offset + 3 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    const view = new DataView(this.buffer);
    view.setUint32(offset, n, false);
    return Ok(undefined);
  }

  readU64BE(offset: number): Result<bigint, IsoBufError> {
    if (offset + 7 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    const view = new DataView(this.buffer);
    return Ok(view.getBigUint64(offset, false)); // false for Big-Endian
  }

  writeU64BE(n: bigint, offset: number): Result<void, IsoBufError> {
    if (offset + 7 >= this.length) {
      return Err(new NotEnoughDataError(None));
    }
    if (n < 0n || n > 0xffffffffffffffffn) {
      return Err(new InvalidEncodingError(None));
    }
    const view = new DataView(this.buffer);
    view.setBigUint64(offset, n, false); // false for Big-Endian
    return Ok(undefined);
  }

  static concat(bufs: IsoBuf[]): IsoBuf {
    const totalSize = bufs.reduce((acc, buf) => acc + buf.length, 0);
    const arr = new IsoBuf(totalSize);
    let offset = 0;
    for (const buf of bufs) {
      arr.set(buf, offset);
      offset += buf.length;
    }
    return arr;
  }

  static from(): never {
    throw new Error("Method 'from' is not supported on IsoBuf");
  }

  static fromHex(hex: string): Result<IsoBuf, IsoBufError> {
    if (!isValidHex(hex)) {
      return Err(new InvalidHexError(None));
    }
    const buf = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      buf[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return Ok(new IsoBuf(buf));
  }

  toHex(): string {
    return Array.from(this)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  static fromNumbers(numbers: number[]) {
    return new IsoBuf(new Uint8Array(numbers));
  }

  toNumbers(): number[] {
    return Array.from(this);
  }
}

export class FixedIsoBuf<N extends number> extends IsoBuf {
  constructor(buf: Uint8Array, size: N) {
    super(buf, size);
    if (buf.length !== size) {
      // returning Result is not possible inside a constructor
      throw new Error(`Expected buffer of length ${size}, got ${buf.length}`);
    }
  }

  static fromUint8Array<N extends number>(
    buf: Uint8Array,
    size: N,
  ): Result<FixedIsoBuf<N>, IsoBufError> {
    if (buf.length > size) {
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < size) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(new FixedIsoBuf(buf, size));
  }
}

// export class IsoBuf32 extends FixedIsoBuf<32> {};

export class IsoBuf32 extends IsoBuf {
  constructor(buf: Uint8Array) {
    const size = buf.length;
    if (size !== 32) {
      // returning Result is not possible inside a constructor
      throw new Error(`Expected buffer of length 32, got ${size}`);
    }
    super(buf, size);
  }

  static fromUint8Array(buf: Uint8Array): Result<IsoBuf32, IsoBufError> {
    if (buf.length > 32) {
      return Err(new TooMuchDataError(None));
    }
    if (buf.length < 32) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(new IsoBuf32(buf));
  }
}