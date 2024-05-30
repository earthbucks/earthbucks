export class IsoBuf {
  public buf: Uint8Array

  constructor(buf: Uint8Array) {
    this.buf = buf
  }

  static fromUint8Array(buf: Uint8Array): IsoBuf {
    return new IsoBuf(buf)
  }

  toUint8Array(): Uint8Array {
    return this.buf
  }
}

export class IsoBufN<N extends number> {
  public buf: Uint8Array;
  public size: N;

  constructor(size: N, buf: Uint8Array) {
    if (buf.length !== size) {
      throw new Error(`Expected buffer of length ${size}, got ${buf.length}`);
    }
    this.size = size;
    this.buf = buf;
  }

  static fromUint8Array<N extends number>(size: N, buf: Uint8Array): IsoBufN<N> {
    return new IsoBufN(size, buf);
  }

  toUint8Array(): Uint8Array {
    return this.buf;
  }
}