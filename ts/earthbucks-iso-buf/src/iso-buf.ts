import { Result, Ok, Err } from "earthbucks-opt-res";

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

  static fromHex(hex: string): Result<IsoBuf, string> {
    if (!/^[0-9a-f]*$/.test(hex) || hex.length % 2 !== 0) {
      return Err("Invalid hex string");
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
  ): Result<FixedIsoBuf<N>, string> {
    if (buf.length !== size) {
      return Err(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    return Ok(new FixedIsoBuf(buf, size));
  }
}

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

  static fromUint8Array(buf: Uint8Array): Result<IsoBuf32, string> {
    if (buf.length !== 32) {
      return Err(`Expected buffer of length 32, got ${buf.length}`);
    }
    return Ok(new IsoBuf32(buf));
  }
}
