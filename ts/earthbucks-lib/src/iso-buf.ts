// Note that this "buffer" package is NOT the same thing as node's standard
// library. It is an API-compatible tool that does in fact "polyfill" or
// "browserify" the correct way. The reason why I'm renaming it here is
// specifically to make sure we always use this version of "Buffer" and never
// the standard node version so that it polyfills in the browser correctly.
// Throughout the TypeScript code, the only type of buffer we ever use should be
// IsoBuf, and it should be compatible with all uses of Uint8Array or node's
// buffer in case we need that with some external dependencies.
import { Buffer } from "buffer";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { Option, Some, None } from "earthbucks-opt-res/src/lib.js";
import { EbxError, InvalidSizeError } from "./ebx-error.js";

const IsoBuf = Buffer;
type IsoBuf = Buffer;

const sizeSymbol = Symbol("size");

class FixedIsoBuf<N extends number> extends IsoBuf {
  [sizeSymbol]: N;

  constructor(size: N, ...args: ConstructorParameters<typeof IsoBuf>) {
    super(...args);
    if (this.length !== size) {
      throw new InvalidSizeError(None);
    }
    this[sizeSymbol] = size;
  }

  static fromIsoBuf<N extends number>(
    size: N,
    buf: IsoBuf,
  ): Result<FixedIsoBuf<N>, EbxError> {
    if (buf.length !== size) {
      return Err(new InvalidSizeError(None));
    }
    // weird roundabout prototype code to avoid calling "new" because on Buffer
    // that is actually deprecated
    const newBuf = Buffer.alloc(size);
    newBuf.set(buf);
    Object.setPrototypeOf(newBuf, FixedIsoBuf.prototype);
    const fixedIsoBufN = newBuf as FixedIsoBuf<N>;
    fixedIsoBufN[sizeSymbol] = size;
    return Ok(fixedIsoBufN);
  }

  // Buffer.alloc
  static alloc<N extends number>(size: N, fill?: number): FixedIsoBuf<N> {
    return (FixedIsoBuf<N>).fromIsoBuf(size, IsoBuf.alloc(size, fill)).unwrap();
  }
}

export { IsoBuf, FixedIsoBuf };
