import { Result, Ok, Err } from "earthbucks-opt-res";

export class U8Arr {
  public buf: Uint8Array;
  public size: number;

  constructor(buf: Uint8Array, size?: number) {
    if (size && buf.length !== size) {
      throw new Error(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    this.size = size || buf.length;
    this.buf = buf;
  }

  toUint8Array(): Uint8Array {
    return this.buf;
  }
}

export class FixedU8<N extends number> extends U8Arr {
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
  ): Result<FixedU8<N>, string> {
    if (buf.length !== size) {
      return Err(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    return Ok(new FixedU8(buf, size));
  }

  toUint8Array(): Uint8Array {
    return this.buf;
  }
}

export class U8_32 extends U8Arr {
  public size: 32 = 32;

  constructor(buf: Uint8Array) {
    const size = buf.length;
    if (size !== 32) {
      // returning Result is not possible inside a constructor
      throw new Error(`Expected buffer of length 32, got ${size}`);
    }
    super(buf, size);
  }

  static fromUint8Array(buf: Uint8Array): Result<U8_32, string> {
    if (buf.length !== 32) {
      return Err(`Expected buffer of length 32, got ${buf.length}`);
    }
    return Ok(new U8_32(buf));
  }
}
