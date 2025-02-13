import {
  encode_base64,
  decode_base64,
  decode_base64_strip_whitespace,
  encode_hex,
  decode_hex,
} from "./rs-webbuf-inline-base64/webbuf.js";

function verifyOffset(offset: number, ext: number, length: number) {
  if (offset % 1 !== 0 || offset < 0) {
    throw new Error("offset is not uint");
  }
  if (offset + ext > length) {
    throw new Error("Trying to access beyond buffer length");
  }
}

export class WebBuf extends Uint8Array {
  static concat(list: Uint8Array[]) {
    const size = list.reduce((acc, buf) => acc + buf.length, 0);
    const result = new WebBuf(size);
    let offset = 0;
    for (const buf of list) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }

  static alloc(size: number, fill = 0) {
    const buf = new WebBuf(size);
    if (fill !== 0) {
      buf.fill(fill);
    }
    return buf;
  }

  fill(value: number, start = 0, end = this.length) {
    for (let i = start; i < end; i++) {
      this[i] = value;
    }
    return this;
  }

  // Override slice method to return WebBuf instead of Uint8Array
  slice(start?: number, end?: number): WebBuf {
    const slicedArray = super.slice(start, end); // Create a slice using Uint8Array's slice method
    return new WebBuf(
      slicedArray.buffer,
      slicedArray.byteOffset,
      slicedArray.byteLength,
    ); // Return a WebBuf instead
  }

  subarray(start?: number, end?: number): WebBuf {
    const subArray = super.subarray(start, end);
    return new WebBuf(
      subArray.buffer,
      subArray.byteOffset,
      subArray.byteLength,
    );
  }

  /**
   * Reverse the buffer in place
   * @returns webbuf
   */
  reverse(): this {
    super.reverse();
    return this;
  }

  clone() {
    return new WebBuf(this);
  }

  toReverse() {
    const cloned = new WebBuf(this);
    cloned.reverse();
    return cloned;
  }

  copy(
    target: WebBuf,
    targetStart = 0,
    sourceStart = 0,
    sourceEnd = this.length,
  ) {
    if (sourceStart >= sourceEnd) {
      return 0;
    }
    if (targetStart >= target.length) {
      throw new Error("targetStart out of bounds");
    }
    if (sourceEnd > this.length) {
      throw new Error("sourceEnd out of bounds");
    }
    if (targetStart + sourceEnd - sourceStart > target.length) {
      throw new Error("source is too large");
    }

    target.set(this.subarray(sourceStart, sourceEnd), targetStart);
    return sourceEnd - sourceStart;
  }

  /**
   * Return a WebBuf that is a view of the same data as the input Uint8Array
   *
   * @param buffer
   * @returns WebBuf
   */
  static view(buffer: Uint8Array): WebBuf {
    return new WebBuf(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }

  /**
   * Create a new WebBuf from a Uint8Array (copy)
   * @param buffer
   * @returns webbuf
   */
  static fromUint8Array(buffer: Uint8Array) {
    return new WebBuf(buffer);
  }

  static fromArray(array: number[]) {
    return new WebBuf(array);
  }

  static fromUtf8(str: string) {
    const encoder = new TextEncoder();
    return new WebBuf(encoder.encode(str));
  }

  static fromString(str: string, encoding: "utf8" | "hex" | "base64" = "utf8") {
    if (encoding === "hex") {
      return WebBuf.fromHex(str);
    }
    if (encoding === "base64") {
      return WebBuf.fromBase64(str);
    }
    if (encoding === "utf8") {
      return WebBuf.fromUtf8(str);
    }
    return WebBuf.fromUtf8(str);
  }

  // we use wasm for big data, because small data is faster in js

  // experiments show wasm is always faster
  static FROM_BASE64_ALGO_THRESHOLD = 10; // str len

  // experiments show wasm is always faster
  static TO_BASE64_ALGO_THRESHOLD = 10; // buf len

  // experimentally derived for optimal performance
  static FROM_HEX_ALGO_THRESHOLD = 1_000; // str len

  // experiments show wasm is always faster
  static TO_HEX_ALGO_THRESHOLD = 10; // buf len

  static fromHexPureJs(hex: string): WebBuf {
    const result = new WebBuf(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
    }
    return result;
  }

  static fromHexWasm(hex: string): WebBuf {
    const uint8array = decode_hex(hex);
    return new WebBuf(
      uint8array.buffer,
      uint8array.byteOffset,
      uint8array.byteLength,
    );
  }

  static fromHex(hex: string): WebBuf {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    if (hex.length < WebBuf.FROM_HEX_ALGO_THRESHOLD) {
      return WebBuf.fromHexPureJs(hex);
    }
    return WebBuf.fromHexWasm(hex);
  }

  toHexPureJs(): string {
    return Array.from(this)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  toHexWasm(): string {
    return encode_hex(this);
  }

  toHex(): string {
    // disabled: experiments show this is not faster, even for small buffers
    // if (this.length < WebBuf.TO_HEX_ALGO_THRESHOLD) {
    //   return this.toHexPureJs();
    // }
    return this.toHexWasm();
  }

  static fromBase64PureJs(b64: string, stripWhitespace = false): WebBuf {
    const uint8array = new Uint8Array(
      atob(stripWhitespace ? b64.replace(/\s+/g, "") : b64)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );
    return new WebBuf(
      uint8array.buffer,
      uint8array.byteOffset,
      uint8array.byteLength,
    );
  }

  static fromBase64Wasm(b64: string, stripWhitespace = false): WebBuf {
    const uint8array = stripWhitespace
      ? decode_base64_strip_whitespace(b64)
      : decode_base64(b64);
    return new WebBuf(
      uint8array.buffer,
      uint8array.byteOffset,
      uint8array.byteLength,
    );
  }

  /**
   * Convert a base64 string to a Uint8Array. Tolerant of whitespace, but
   * throws if the string has invalid characters.
   *
   * @param b64
   * @returns Uint8Array
   * @throws {Error} if the input string is not valid base64
   */
  static fromBase64(b64: string, stripWhitespace = false): WebBuf {
    // disabled: experiments show this is not faster, even for small buffers
    // if (b64.length < WebBuf.FROM_BASE64_ALGO_THRESHOLD) {
    //   return WebBuf.fromBase64PureJs(b64, stripWhitespace);
    // }
    return WebBuf.fromBase64Wasm(b64, stripWhitespace);
  }

  toBase64PureJs(): string {
    return btoa(String.fromCharCode(...new Uint8Array(this)));
  }

  toBase64Wasm(): string {
    return encode_base64(this);
  }

  toBase64() {
    // disabled: experiments show this is not faster, even for small buffers
    // if (this.length < WebBuf.TO_BASE64_ALGO_THRESHOLD) {
    //   return this.toBase64PureJs();
    // }
    return this.toBase64Wasm();
  }

  /**
   * Override Uint8Array.from to return a WebBuf
   *
   * @param source An array-like or iterable object to convert to WebBuf
   * @param mapFn Optional map function to call on every element of the array
   * @param thisArg Optional value to use as `this` when executing `mapFn`
   * @returns WebBuf
   */
  static from(
    source: ArrayLike<number> | Iterable<number> | string,
    mapFn?: ((v: number, k: number) => number) | string,
    // biome-ignore lint:
    thisArg?: any,
  ): WebBuf {
    if (typeof mapFn === "string") {
      if (typeof source !== "string") {
        throw new TypeError("Invalid mapFn");
      }
      if (mapFn === "hex") {
        return WebBuf.fromHex(source);
      }
      if (mapFn === "base64") {
        return WebBuf.fromBase64(source);
      }
      if (mapFn === "utf8") {
        return WebBuf.fromUtf8(source);
      }
      throw new TypeError("Invalid mapFn");
    }
    if (typeof source === "string") {
      return WebBuf.fromUtf8(source);
    }
    if (source instanceof Uint8Array) {
      return WebBuf.view(source);
    }
    const sourceArray = Array.from(source);
    // biome-ignore lint:
    const uint8Array = super.from(sourceArray, mapFn, thisArg);
    return new WebBuf(
      uint8Array.buffer,
      uint8Array.byteOffset,
      uint8Array.byteLength,
    );
  }

  toUtf8(): string {
    const decoder = new TextDecoder();
    return decoder.decode(this);
  }

  toString(encoding?: "utf8" | "hex" | "base64") {
    if (encoding === "hex") {
      return this.toHex();
    }
    if (encoding === "base64") {
      return this.toBase64();
    }
    if (encoding === "utf8") {
      const decoder = new TextDecoder();
      return decoder.decode(this);
    }
    return this.toUtf8();
  }

  inspect() {
    return `<WebBuf ${this.toHex().slice(0, 40) + (this.length > 40 ? "..." : "")}>`;
  }

  toArray() {
    return Array.from(this);
  }

  compare(other: WebBuf): number {
    const len = Math.min(this.length, other.length);

    for (let i = 0; i < len; i++) {
      if (this[i] !== other[i]) {
        return (this[i] as number) < (other[i] as number) ? -1 : 1;
      }
    }

    if (this.length < other.length) {
      return -1;
    }
    if (this.length > other.length) {
      return 1;
    }

    return 0;
  }

  static compare(buf1: WebBuf, buf2: WebBuf): number {
    return buf1.compare(buf2);
  }

  equals(other: WebBuf): boolean {
    return this.compare(other) === 0;
  }

  write(buf: WebBuf, offset = 0): number {
    verifyOffset(offset, buf.length, this.length);
    this.set(buf, offset);
    return buf.length;
  }

  read(offset: number, ext: number): WebBuf {
    verifyOffset(offset, ext, this.length);
    return this.subarray(offset, offset + ext);
  }
}
