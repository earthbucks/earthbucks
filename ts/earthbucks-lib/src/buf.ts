import { WebBuf } from "webbuf";
import bs58 from "bs58";

function isValidHex(hex: string): boolean {
  return /^[0-9a-f]*$/.test(hex) && hex.length % 2 === 0;
}

function encodeHex(buffer: WebBuf): string {
  return buffer.toString("hex");
}

function decodeHex(hex: string): WebBuf {
  if (!isValidHex(hex)) {
    throw new Error("invalid hex");
  }
  const sysBuf = WebBuf.from(hex, "hex");
  return sysBuf;
}

class EbxBuf {
  public _buf: WebBuf;

  constructor(size: number, buf: WebBuf) {
    if (buf.length !== size) {
      throw new Error("invalid size error");
    }
    this._buf = buf;
  }

  get buf(): WebBuf {
    return this._buf;
  }

  static fromBuf<N extends number>(size: N, buf: WebBuf): EbxBuf {
    return new EbxBuf(size, buf);
  }

  static alloc(size: number, fill?: number): EbxBuf {
    return EbxBuf.fromBuf(size, WebBuf.alloc(size, fill));
  }

  static fromHex(size: number, hex: string): EbxBuf {
    const buf = decodeHex(hex);
    return EbxBuf.fromBuf(size, buf);
  }

  toHex(): string {
    return encodeHex(this._buf);
  }

  static fromBase64(size: number, base64: string): EbxBuf {
    try {
      const buf = WebBuf.from(base64, "base64");
      return EbxBuf.fromBuf(size, buf);
    } catch (err) {
      throw new Error("invalid encoding");
    }
  }

  toBase64(): string {
    return this._buf.toString("base64");
  }

  static fromBase58(size: number, base58: string): EbxBuf {
    try {
      const buf = WebBuf.from(bs58.decode(base58));
      return EbxBuf.fromBuf(size, buf);
    } catch (err) {
      throw new Error("invalid encoding");
    }
  }

  toBase58(): string {
    return bs58.encode(this._buf);
  }

  static fromRandom(size: number): EbxBuf {
    const buf = crypto.getRandomValues(WebBuf.alloc(size));
    return EbxBuf.fromBuf(size, buf);
  }
}

const sizeSymbol = Symbol("size");

class FixedBuf<N extends number> extends EbxBuf {
  [sizeSymbol]: N;

  constructor(size: N, buf: WebBuf) {
    super(size, buf);
    this[sizeSymbol] = size;
  }

  static fromBuf<N extends number>(size: N, buf: WebBuf): FixedBuf<N> {
    return new FixedBuf(size, buf);
  }

  static alloc<N extends number>(size: N, fill?: number): FixedBuf<N> {
    return FixedBuf.fromBuf(size, WebBuf.alloc(size, fill));
  }

  static fromHex<N extends number>(size: N, hex: string): FixedBuf<N> {
    const buf = decodeHex(hex);
    return FixedBuf.fromBuf(size, buf);
  }

  static fromBase58<N extends number>(size: N, base58: string): FixedBuf<N> {
    const buf = WebBuf.from(bs58.decode(base58));
    return FixedBuf.fromBuf(size, buf);
  }

  static fromRandom<N extends number>(size: N): FixedBuf<N> {
    const buf = crypto.getRandomValues(WebBuf.alloc(size));
    return FixedBuf.fromBuf(size, buf);
  }

  clone(): FixedBuf<N> {
    return FixedBuf.fromBuf(this[sizeSymbol], WebBuf.from(this._buf));
  }
}

export { WebBuf, EbxBuf, FixedBuf };
