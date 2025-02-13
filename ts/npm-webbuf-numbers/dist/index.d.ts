import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
export declare abstract class FixedNum<N extends number> {
    buf: FixedBuf<N>;
    constructor(buf: FixedBuf<N>);
    abstract toBn(): bigint;
    abstract add(other: FixedNum<N>): FixedNum<N>;
    abstract sub(other: FixedNum<N>): FixedNum<N>;
    abstract mul(other: FixedNum<N>): FixedNum<N>;
    abstract div(other: FixedNum<N>): FixedNum<N>;
    abstract toBEBuf(): FixedBuf<N>;
    abstract toLEBuf(): FixedBuf<N>;
    abstract toHex(): string;
    abstract get n(): number;
    abstract get bn(): bigint;
}
export declare class U8 extends FixedNum<1> {
    constructor(buf: FixedBuf<1> | number | bigint);
    static fromBn(bn: bigint): U8;
    static fromN(n: number): U8;
    toBn(): bigint;
    add(other: U8): U8;
    sub(other: U8): U8;
    mul(other: U8): U8;
    div(other: U8): U8;
    toBEBuf(): FixedBuf<1>;
    toLEBuf(): FixedBuf<1>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<1> | WebBuf): U8;
    static fromLEBuf(buf: FixedBuf<1> | WebBuf): U8;
    static fromHex(hex: string): U8;
    get n(): number;
    get bn(): bigint;
}
export declare class U16BE extends FixedNum<2> {
    constructor(buf: FixedBuf<2> | number | bigint);
    static fromBn(bn: bigint): U16BE;
    static fromN(n: number): U16BE;
    toBn(): bigint;
    add(other: U16BE): U16BE;
    sub(other: U16BE): U16BE;
    mul(other: U16BE): U16BE;
    div(other: U16BE): U16BE;
    toBEBuf(): FixedBuf<2>;
    toLEBuf(): FixedBuf<2>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<2> | WebBuf): U16BE;
    static fromLEBuf(buf: FixedBuf<2> | WebBuf): U16BE;
    static fromHex(hex: string): U16BE;
    get n(): number;
    get bn(): bigint;
}
export declare class U32BE extends FixedNum<4> {
    constructor(buf: FixedBuf<4> | number | bigint);
    static fromBn(bn: bigint): U32BE;
    static fromN(n: number): U32BE;
    toBn(): bigint;
    add(other: U32BE): U32BE;
    sub(other: U32BE): U32BE;
    mul(other: U32BE): U32BE;
    div(other: U32BE): U32BE;
    toBEBuf(): FixedBuf<4>;
    toLEBuf(): FixedBuf<4>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<4> | WebBuf): U32BE;
    static fromLEBuf(buf: FixedBuf<4> | WebBuf): U32BE;
    static fromHex(hex: string): U32BE;
    get n(): number;
    get bn(): bigint;
}
export declare class U64BE extends FixedNum<8> {
    constructor(buf: FixedBuf<8> | number | bigint);
    static fromBn(bn: bigint): U64BE;
    static fromN(n: number): U64BE;
    toBn(): bigint;
    add(other: U64BE): U64BE;
    sub(other: U64BE): U64BE;
    mul(other: U64BE): U64BE;
    div(other: U64BE): U64BE;
    toBEBuf(): FixedBuf<8>;
    toLEBuf(): FixedBuf<8>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<8> | WebBuf): U64BE;
    static fromLEBuf(buf: FixedBuf<8> | WebBuf): U64BE;
    static fromHex(hex: string): U64BE;
    get n(): number;
    get bn(): bigint;
}
export declare class U128BE extends FixedNum<16> {
    constructor(buf: FixedBuf<16> | number | bigint);
    static fromBn(bn: bigint): U128BE;
    static fromN(n: number): U128BE;
    toBn(): bigint;
    add(other: U128BE): U128BE;
    sub(other: U128BE): U128BE;
    mul(other: U128BE): U128BE;
    div(other: U128BE): U128BE;
    toBEBuf(): FixedBuf<16>;
    toLEBuf(): FixedBuf<16>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<16> | WebBuf): U128BE;
    static fromLEBuf(buf: FixedBuf<16> | WebBuf): U128BE;
    static fromHex(hex: string): U128BE;
    get n(): number;
    get bn(): bigint;
}
export declare class U256BE extends FixedNum<32> {
    constructor(buf: FixedBuf<32> | number | bigint);
    static fromBn(bn: bigint): U256BE;
    static fromN(n: number): U256BE;
    toBn(): bigint;
    add(other: U256BE): U256BE;
    sub(other: U256BE): U256BE;
    mul(other: U256BE): U256BE;
    div(other: U256BE): U256BE;
    toBEBuf(): FixedBuf<32>;
    toLEBuf(): FixedBuf<32>;
    toHex(): string;
    static fromBEBuf(buf: FixedBuf<32> | WebBuf): U256BE;
    static fromLEBuf(buf: FixedBuf<32> | WebBuf): U256BE;
    static fromHex(hex: string): U256BE;
    get n(): number;
    get bn(): bigint;
}
