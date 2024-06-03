// Note that this "buffer" package is NOT the same thing as node's standard
// library. It is an API-compatible tool that does in fact "polyfill" or
// "browserify" the correct way. The reason why I'm renaming it here is
// specifically to make sure we always use this version of "Buffer" and never
// the standard node version so that it polyfills in the browser correctly.
import { Buffer } from "buffer";
import {
  EbxError,
  InvalidSizeError,
  InvalidHexError,
  InvalidEncodingError,
} from "./ebx-error.js";
import bs58 from "bs58";

const SysBuf = Buffer;
type SysBuf = Buffer;

function isValidHex(hex: string): boolean {
  return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
}

function encodeHex(buffer: SysBuf): string {
  return buffer.toString("hex");
}

function decodeHex(hex: string): SysBuf {
  if (!isValidHex(hex)) {
    throw new InvalidHexError();
  }
  const sysBuf = SysBuf.from(hex, "hex");
  return sysBuf;
}

class IsoBuf extends SysBuf {
  static fromBuf<N extends number>(size: N, buf: SysBuf): IsoBuf {
    if (buf.length !== size) {
      throw new InvalidSizeError();
    }
    // weird roundabout prototype code to avoid calling "new" because on Buffer
    // that is actually deprecated
    const newBuf = SysBuf.alloc(size);
    newBuf.set(buf);
    Object.setPrototypeOf(newBuf, IsoBuf.prototype);
    const isoBuf = newBuf as IsoBuf;
    return isoBuf;
  }

  static alloc(size: number, fill?: number): IsoBuf {
    return IsoBuf.fromBuf(size, SysBuf.alloc(size, fill));
  }

  static fromStrictHex(size: number, hex: string): IsoBuf {
    const buf = decodeHex(hex);
    return IsoBuf.fromBuf(size, buf);
  }

  toStrictHex(): string {
    return encodeHex(this);
  }

  static fromBase58(size: number, base58: string): IsoBuf {
    try {
      const buf = SysBuf.from(bs58.decode(base58));
      return IsoBuf.fromBuf(size, buf);
    } catch (err) {
      throw new InvalidEncodingError();
    }
  }

  toBase58(): string {
    return bs58.encode(this);
  }
}

const sizeSymbol = Symbol("size");

class FixedIsoBuf<N extends number> extends IsoBuf {
  [sizeSymbol]: N;

  constructor(size: N, ...args: ConstructorParameters<typeof SysBuf>) {
    super(...args);
    if (this.length !== size) {
      throw new InvalidSizeError();
    }
    this[sizeSymbol] = size;
  }

  static fromBuf<N extends number>(size: N, buf: SysBuf): FixedIsoBuf<N> {
    if (buf.length !== size) {
      throw new InvalidSizeError();
    }
    // weird roundabout prototype code to avoid calling "new" because on Buffer
    // that is actually deprecated
    const newBuf = Buffer.alloc(size);
    newBuf.set(buf);
    Object.setPrototypeOf(newBuf, FixedIsoBuf.prototype);
    const fixedIsoBufN = newBuf as FixedIsoBuf<N>;
    fixedIsoBufN[sizeSymbol] = size;
    return fixedIsoBufN;
  }

  static alloc<N extends number>(size: N, fill?: number): FixedIsoBuf<N> {
    return FixedIsoBuf.fromBuf(size, SysBuf.alloc(size, fill));
  }

  static fromStrictHex<N extends number>(size: N, hex: string): FixedIsoBuf<N> {
    const buf = decodeHex(hex);
    return FixedIsoBuf.fromBuf(size, buf);
  }

  toStrictHex(): string {
    return encodeHex(this);
  }

  static fromBase58<N extends number>(size: N, base58: string): FixedIsoBuf<N> {
    const buf = SysBuf.from(bs58.decode(base58));
    return FixedIsoBuf.fromBuf(size, buf);
  }

  toBase58(): string {
    return bs58.encode(this);
  }
}

export { SysBuf, FixedIsoBuf, IsoBuf };
