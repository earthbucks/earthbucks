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
