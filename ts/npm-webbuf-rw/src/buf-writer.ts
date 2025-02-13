import { WebBuf } from "@webbuf/webbuf";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";

export class BufWriter {
  bufs: WebBuf[];

  constructor(bufs?: WebBuf[]) {
    this.bufs = bufs ? bufs.map((arr) => WebBuf.from(arr)) : [];
  }

  getLength(): number {
    let len = 0;
    for (const buf of this.bufs) {
      len += buf.length;
    }
    return len;
  }

  toBuf(): WebBuf {
    return WebBuf.concat(this.bufs);
  }

  write(buf: WebBuf): this {
    this.bufs.push(buf);
    return this;
  }

  writeU8(u8: U8): this {
    this.write(u8.toBEBuf().buf);
    return this;
  }

  writeU16BE(u16: U16BE): this {
    this.write(u16.toBEBuf().buf);
    return this;
  }

  writeU32BE(u32: U32BE): this {
    this.write(u32.toBEBuf().buf);
    return this;
  }

  writeU64BE(u64: U64BE): this {
    this.write(u64.toBEBuf().buf);
    return this;
  }

  writeU128BE(u128: U128BE): this {
    this.write(u128.toBEBuf().buf);
    return this;
  }

  writeU256BE(u256: U256BE): this {
    this.write(u256.toBEBuf().buf);
    return this;
  }

  writeVarIntU64BE(u64: U64BE): this {
    const buf = BufWriter.varIntU64BEBuf(u64);
    this.write(buf);
    return this;
  }

  static varIntU64BEBuf(bn: U64BE): WebBuf {
    let buf: WebBuf;
    const n = bn.n;
    if (n < 253) {
      buf = WebBuf.alloc(1);
      buf.write(U8.fromN(n).toBEBuf().buf, 0);
    } else if (n < 0x10000) {
      buf = WebBuf.alloc(1 + 2);
      buf.write(U8.fromN(253).toBEBuf().buf, 0);
      buf.write(U16BE.fromN(n).toBEBuf().buf, 1);
    } else if (n < 0x100000000) {
      buf = WebBuf.alloc(1 + 4);
      buf.write(U8.fromN(254).toBEBuf().buf, 0);
      buf.write(U32BE.fromN(n).toBEBuf().buf, 1);
    } else {
      buf = WebBuf.alloc(1 + 8);
      buf.write(U8.fromN(255).toBEBuf().buf, 0);
      buf.write(bn.toBEBuf().buf, 1);
    }
    return buf;
  }
}
