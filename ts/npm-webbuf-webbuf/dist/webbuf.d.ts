export declare class WebBuf extends Uint8Array {
    static concat(list: Uint8Array[]): WebBuf;
    static alloc(size: number, fill?: number): WebBuf;
    fill(value: number, start?: number, end?: number): this;
    slice(start?: number, end?: number): WebBuf;
    subarray(start?: number, end?: number): WebBuf;
    clone(): WebBuf;
    toReverse(): WebBuf;
    copy(target: WebBuf, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
    /**
     * Return a WebBuf that is a view of the same data as the input Uint8Array
     *
     * @param buffer
     * @returns WebBuf
     */
    static view(buffer: Uint8Array): WebBuf;
    /**
     * Create a new WebBuf from a Uint8Array (copy)
     * @param buffer
     * @returns webbuf
     */
    static fromUint8Array(buffer: Uint8Array): WebBuf;
    static fromArray(array: number[]): WebBuf;
    static fromUtf8(str: string): WebBuf;
    static fromString(str: string, encoding?: "utf8" | "hex" | "base64"): WebBuf;
    static FROM_BASE64_ALGO_THRESHOLD: number;
    static TO_BASE64_ALGO_THRESHOLD: number;
    static FROM_HEX_ALGO_THRESHOLD: number;
    static TO_HEX_ALGO_THRESHOLD: number;
    static fromHexPureJs(hex: string): WebBuf;
    static fromHexWasm(hex: string): WebBuf;
    static fromHex(hex: string): WebBuf;
    toHexPureJs(): string;
    toHexWasm(): string;
    toHex(): string;
    static fromBase64PureJs(b64: string, stripWhitespace?: boolean): WebBuf;
    static fromBase64Wasm(b64: string, stripWhitespace?: boolean): WebBuf;
    /**
     * Convert a base64 string to a Uint8Array. Tolerant of whitespace, but
     * throws if the string has invalid characters.
     *
     * @param b64
     * @returns Uint8Array
     * @throws {Error} if the input string is not valid base64
     */
    static fromBase64(b64: string, stripWhitespace?: boolean): WebBuf;
    toBase64PureJs(): string;
    toBase64Wasm(): string;
    toBase64(): string;
    /**
     * Override Uint8Array.from to return a WebBuf
     *
     * @param source An array-like or iterable object to convert to WebBuf
     * @param mapFn Optional map function to call on every element of the array
     * @param thisArg Optional value to use as `this` when executing `mapFn`
     * @returns WebBuf
     */
    static from(source: ArrayLike<number> | Iterable<number> | string, mapFn?: ((v: number, k: number) => number) | string, thisArg?: any): WebBuf;
    toUtf8(): string;
    toString(encoding?: "utf8" | "hex" | "base64"): string;
    inspect(): string;
    toArray(): number[];
    compare(other: WebBuf): number;
    static compare(buf1: WebBuf, buf2: WebBuf): number;
    equals(other: WebBuf): boolean;
    write(buf: WebBuf, offset?: number): number;
    read(offset: number, ext: number): WebBuf;
}
