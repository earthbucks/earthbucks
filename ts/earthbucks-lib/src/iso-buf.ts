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

class FixedIsoBuf<N extends number> extends IsoBuf {
  size: N;
  constructor(size: N, ...args: ConstructorParameters<typeof IsoBuf>) {
    super(...args);
    if (this.length !== size) {
      throw new InvalidSizeError(None);
    }
    this.size = size;
  }

  static fromBuffer<N extends number>(buf: IsoBuf, size: N): Result<FixedIsoBuf<N>, EbxError> {
    if (buf.length !== size) {
      return Err(new InvalidSizeError(None));
    }
    return Ok(new FixedIsoBuf<N>(size, buf));
  }

  // Buffer.alloc
  static alloc<N extends number>(size: N, fill?: number): FixedIsoBuf<N> {
    return new FixedIsoBuf<N>(size, Buffer.alloc(size, fill));
  }
}

export { IsoBuf, FixedIsoBuf };
