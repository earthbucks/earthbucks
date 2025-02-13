import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";
export declare class BufWriter {
    bufs: WebBuf[];
    constructor(bufs?: WebBuf[]);
    getLength(): number;
    toBuf(): WebBuf;
    write(buf: WebBuf): this;
    writeU8(u8: U8): this;
    writeU16BE(u16: U16BE): this;
    writeU32BE(u32: U32BE): this;
    writeU64BE(u64: U64BE): this;
    writeU128BE(u128: U128BE): this;
    writeU256BE(u256: U256BE): this;
    writeVarIntU64BE(u64: U64BE): this;
    static varIntU64BEBuf(bn: U64BE): WebBuf;
}
