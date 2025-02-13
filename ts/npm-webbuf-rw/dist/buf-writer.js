import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE } from "@webbuf/numbers";
export class BufWriter {
    bufs;
    constructor(bufs) {
        this.bufs = bufs ? bufs.map((arr) => WebBuf.from(arr)) : [];
    }
    getLength() {
        let len = 0;
        for (const buf of this.bufs) {
            len += buf.length;
        }
        return len;
    }
    toBuf() {
        return WebBuf.concat(this.bufs);
    }
    write(buf) {
        this.bufs.push(buf);
        return this;
    }
    writeU8(u8) {
        this.write(u8.toBEBuf().buf);
        return this;
    }
    writeU16BE(u16) {
        this.write(u16.toBEBuf().buf);
        return this;
    }
    writeU32BE(u32) {
        this.write(u32.toBEBuf().buf);
        return this;
    }
    writeU64BE(u64) {
        this.write(u64.toBEBuf().buf);
        return this;
    }
    writeU128BE(u128) {
        this.write(u128.toBEBuf().buf);
        return this;
    }
    writeU256BE(u256) {
        this.write(u256.toBEBuf().buf);
        return this;
    }
    writeVarIntU64BE(u64) {
        const buf = BufWriter.varIntU64BEBuf(u64);
        this.write(buf);
        return this;
    }
    static varIntU64BEBuf(bn) {
        let buf;
        const n = bn.n;
        if (n < 253) {
            buf = WebBuf.alloc(1);
            buf.write(U8.fromN(n).toBEBuf().buf, 0);
        }
        else if (n < 0x10000) {
            buf = WebBuf.alloc(1 + 2);
            buf.write(U8.fromN(253).toBEBuf().buf, 0);
            buf.write(U16BE.fromN(n).toBEBuf().buf, 1);
        }
        else if (n < 0x100000000) {
            buf = WebBuf.alloc(1 + 4);
            buf.write(U8.fromN(254).toBEBuf().buf, 0);
            buf.write(U32BE.fromN(n).toBEBuf().buf, 1);
        }
        else {
            buf = WebBuf.alloc(1 + 8);
            buf.write(U8.fromN(255).toBEBuf().buf, 0);
            buf.write(bn.toBEBuf().buf, 1);
        }
        return buf;
    }
}
