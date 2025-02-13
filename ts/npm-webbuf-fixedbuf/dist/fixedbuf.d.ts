import { WebBuf } from "@webbuf/webbuf";
export declare class FixedBuf<N extends number> {
    _buf: WebBuf;
    _size: N;
    constructor(size: N, buf: WebBuf);
    get buf(): WebBuf;
    static fromBuf<N extends number>(size: N, buf: WebBuf): FixedBuf<N>;
    static alloc<N extends number>(size: N, fill?: number): FixedBuf<N>;
    static fromHex<N extends number>(size: N, hex: string): FixedBuf<N>;
    toHex(): string;
    static fromBase64(size: number, base64: string): FixedBuf<number>;
    toBase64(): string;
    static fromRandom<N extends number>(size: N): FixedBuf<N>;
    clone(): FixedBuf<N>;
    toReverse(): FixedBuf<N>;
}
