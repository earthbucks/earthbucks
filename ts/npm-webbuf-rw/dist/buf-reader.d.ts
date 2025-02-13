import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";
export declare class BufReader {
    buf: WebBuf;
    pos: number;
    constructor(buf: WebBuf);
    eof(): boolean;
    read(len: number): WebBuf;
    readFixed<N extends number>(len: N): FixedBuf<N>;
    readRemainder(): WebBuf;
    readU8(): U8;
    readU16BE(): U16BE;
    readU32BE(): U32BE;
    readU64BE(): U64BE;
    readU128BE(): U128BE;
    readU256BE(): U256BE;
    readVarIntBEBuf(): WebBuf;
    readVarIntU64BE(): U64BE;
}
