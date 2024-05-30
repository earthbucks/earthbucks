import { Result, Ok, Err } from "earthbucks-opt-res";
import { Option, Some, None } from "earthbucks-opt-res";
import {
  InvalidEncodingError,
  InvalidHexError,
  IsoBufError,
  NotEnoughDataError,
  TooMuchDataError,
} from "./iso-buf-error";

export function isValidHex(hex: string) {
  if (!/^[0-9a-f]*$/.test(hex) || hex.length % 2 !== 0) {
    return false;
  }
  return true;
}

export class IsoBuf {
  public arr: Uint8Array;
  public size: number;

  constructor(buf: Uint8Array, size?: number) {
    if (size && buf.length !== size) {
      throw new Error(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    this.size = size || buf.length;
    this.arr = buf;
  }

  get length(): number {
    return this.arr.length;
  }

  subarray(start: number, end: number): IsoBuf {
    return new IsoBuf(this.arr.subarray(start, end));
  }

  static alloc(size: number): IsoBuf {
    return new IsoBuf(new Uint8Array(size));
  }

  set(isoBuf: IsoBuf): void {
    this.arr.set(isoBuf.arr);
  }

  readU8(offset: number): Result<number, IsoBufError> {
    if (offset >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(this.arr[offset]);
  }

  writeU8(n: number, offset: number): Result<void, IsoBufError> {
    if (offset >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    this.arr[offset] = n;
    return Ok(undefined);
  }

  readU16BE(offset: number): Result<number, IsoBufError> {
    if (offset + 1 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok((this.arr[offset] << 8) | this.arr[offset + 1]);
  }

  writeU16BE(n: number, offset: number): Result<void, IsoBufError> {
    if (offset + 1 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    this.arr[offset] = n >> 8;
    this.arr[offset + 1] = n & 0xff;
    return Ok(undefined);
  }

  readU32BE(offset: number): Result<number, IsoBufError> {
    if (offset + 3 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(
      (this.arr[offset] << 24) |
        (this.arr[offset + 1] << 16) |
        (this.arr[offset + 2] << 8) |
        this.arr[offset + 3],
    );
  }

  writeU32BE(n: number, offset: number): Result<void, IsoBufError> {
    if (offset + 3 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    this.arr[offset] = n >> 24;
    this.arr[offset + 1] = (n >> 16) & 0xff;
    this.arr[offset + 2] = (n >> 8) & 0xff;
    this.arr[offset + 3] = n & 0xff;
    return Ok(undefined);
  }

  readU64BE(offset: number): Result<bigint, IsoBufError> {
    if (offset + 7 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    return Ok(
      (BigInt(this.arr[offset]) << 56n) |
        (BigInt(this.arr[offset + 1]) << 48n) |
        (BigInt(this.arr[offset + 2]) << 40n) |
        (BigInt(this.arr[offset + 3]) << 32n) |
        (BigInt(this.arr[offset + 4]) << 24n) |
        (BigInt(this.arr[offset + 5]) << 16n) |
        (BigInt(this.arr[offset + 6]) << 8n) |
        BigInt(this.arr[offset + 7]),
    );
  }

  writeU64BE(n: bigint, offset: number): Result<void, IsoBufError> {
    if (offset + 7 >= this.arr.length) {
      return Err(new NotEnoughDataError(None));
    }
    if (n < 0n || n > 0xffffffffffffffffn) {
      return Err(new InvalidEncodingError(None));
    }
    this.arr[offset] = Number(n >> 56n);
    this.arr[offset + 1] = Number((n >> 48n) & 0xffn);
    this.arr[offset + 2] = Number((n >> 40n) & 0xffn);
    this.arr[offset + 3] = Number((n >> 32n) & 0xffn);
    this.arr[offset + 4] = Number((n >> 24n) & 0xffn);
    this.arr[offset + 5] = Number((n >> 16n) & 0xffn);
    this.arr[offset + 6] = Number((n >> 8n) & 0xffn);
    this.arr[offset + 7] = Number(n & 0xffn);
    return Ok(undefined);
  }

  static concat(bufs: IsoBuf[]): IsoBuf {
    const totalSize = bufs.reduce((acc, buf) => acc + buf.length, 0);
    const arr = new Uint8Array(totalSize);
    let offset = 0;
    for (const buf of bufs) {
      arr.set(buf.arr, offset);
      offset += buf.length;
    }
    return new IsoBuf(arr);
  }

  static from(buf: Uint8Array): IsoBuf {
    return new IsoBuf(buf);
  }

  toUint8Array(): Uint8Array {
    return this.arr;
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
    return Array.from(this.arr)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
}

export class FixedIsoBuf<N extends number> extends IsoBuf {
  public size: N;

  constructor(buf: Uint8Array, size: N) {
    super(buf, size);
    if (buf.length !== size) {
      // returning Result is not possible inside a constructor
      throw new Error(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    this.size = size;
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
  public size: 32 = 32;

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
