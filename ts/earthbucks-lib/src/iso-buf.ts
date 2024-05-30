// Note that this "buffer" package is NOT the same thing as node's standard
// library. It is an API-compatible tool that does in fact "polyfill" or
// "browserify" the correct way. The reason why I'm renaming it here is
// specifically to make sure we always use this version of "Buffer" and never
// the standard node version so that it polyfills in the browser correctly.
// Throughout the TypeScript code, the only type of buffer we ever use should be
// IsoBuf, and it should be compatible with all uses of Uint8Array or node's
// buffer in case we need that with some external dependencies.
import { Buffer } from "buffer";

const IsoBuf = Buffer;
type IsoBuf = Buffer;

export { IsoBuf as IsoBuf };
