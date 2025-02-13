import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
export class FixedNum {
    buf;
    constructor(buf) {
        this.buf = buf;
    }
}
export class U8 extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U8.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U8.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        if (bn < 0 || bn > 0xffn) {
            throw new Error("Invalid number");
        }
        return new U8(FixedBuf.fromBuf(1, WebBuf.fromArray([Number(bn)])));
    }
    static fromN(n) {
        return U8.fromBn(BigInt(n));
    }
    toBn() {
        return BigInt(this.buf.buf[0]);
    }
    add(other) {
        return U8.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U8.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U8.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U8.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.clone();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U8(FixedBuf.fromBuf(1, buf));
        }
        return new U8(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U8(FixedBuf.fromBuf(1, buf));
        }
        return new U8(buf);
    }
    static fromHex(hex) {
        return new U8(FixedBuf.fromHex(1, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
export class U16BE extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U16BE.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U16BE.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        if (bn < 0 || bn > 0xffffn) {
            throw new Error("Invalid number");
        }
        return new U16BE(FixedBuf.fromBuf(2, WebBuf.fromArray([Number(bn >> 8n), Number(bn)])));
    }
    static fromN(n) {
        return U16BE.fromBn(BigInt(n));
    }
    toBn() {
        return ((BigInt(this.buf.buf[0]) << 8n) +
            BigInt(this.buf.buf[1]));
    }
    add(other) {
        return U16BE.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U16BE.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U16BE.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U16BE.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.toReverse();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U16BE(FixedBuf.fromBuf(2, buf));
        }
        return new U16BE(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U16BE(FixedBuf.fromBuf(2, buf).toReverse());
        }
        return new U16BE(buf.toReverse());
    }
    static fromHex(hex) {
        return new U16BE(FixedBuf.fromHex(2, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
export class U32BE extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U32BE.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U32BE.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        const byteLen = 4;
        if (bn < 0 || bn > 0xffffffffffffffffn) {
            throw new Error("Invalid number");
        }
        const bytes = new Array(byteLen);
        for (let i = byteLen - 1; i >= 0; i--) {
            bytes[i] = Number(bn & 0xffn);
            bn >>= 8n; // Shift right by 8 bits in-place
        }
        return new U32BE(FixedBuf.fromBuf(byteLen, WebBuf.fromArray(bytes)));
    }
    static fromN(n) {
        return U32BE.fromBn(BigInt(n));
    }
    toBn() {
        const byteLen = 4;
        let result = 0n;
        for (let i = 0; i < byteLen; i++) {
            result = (result << 8n) + BigInt(this.buf.buf[i]);
        }
        return result;
    }
    add(other) {
        return U32BE.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U32BE.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U32BE.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U32BE.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.toReverse();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U32BE(FixedBuf.fromBuf(4, buf));
        }
        return new U32BE(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U32BE(FixedBuf.fromBuf(4, buf).toReverse());
        }
        return new U32BE(buf.toReverse());
    }
    static fromHex(hex) {
        return new U32BE(FixedBuf.fromHex(4, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
export class U64BE extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U64BE.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U64BE.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        const byteLen = 8;
        if (bn < 0 || bn > 0xffffffffffffffffn) {
            throw new Error("Invalid number");
        }
        const bytes = new Array(byteLen);
        for (let i = byteLen - 1; i >= 0; i--) {
            bytes[i] = Number(bn & 0xffn);
            bn >>= 8n; // Shift right by 8 bits in-place
        }
        return new U64BE(FixedBuf.fromBuf(byteLen, WebBuf.fromArray(bytes)));
    }
    static fromN(n) {
        return U64BE.fromBn(BigInt(n));
    }
    toBn() {
        const byteLen = 8;
        let result = 0n;
        for (let i = 0; i < byteLen; i++) {
            result = (result << 8n) + BigInt(this.buf.buf[i]);
        }
        return result;
    }
    add(other) {
        return U64BE.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U64BE.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U64BE.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U64BE.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.toReverse();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U64BE(FixedBuf.fromBuf(8, buf));
        }
        return new U64BE(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U64BE(FixedBuf.fromBuf(8, buf).toReverse());
        }
        return new U64BE(buf.toReverse());
    }
    static fromHex(hex) {
        return new U64BE(FixedBuf.fromHex(8, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
export class U128BE extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U128BE.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U128BE.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        const byteLen = 16;
        if (bn < 0 || bn > 0xffffffffffffffffffffffffffffffffn) {
            throw new Error("Invalid number");
        }
        const bytes = new Array(byteLen);
        for (let i = byteLen - 1; i >= 0; i--) {
            bytes[i] = Number(bn & 0xffn);
            bn >>= 8n; // Shift right by 8 bits in-place
        }
        return new U128BE(FixedBuf.fromBuf(byteLen, WebBuf.fromArray(bytes)));
    }
    static fromN(n) {
        return U128BE.fromBn(BigInt(n));
    }
    toBn() {
        const byteLen = 16;
        let result = 0n;
        for (let i = 0; i < byteLen; i++) {
            result = (result << 8n) + BigInt(this.buf.buf[i]);
        }
        return result;
    }
    add(other) {
        return U128BE.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U128BE.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U128BE.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U128BE.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.toReverse();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U128BE(FixedBuf.fromBuf(16, buf));
        }
        return new U128BE(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U128BE(FixedBuf.fromBuf(16, buf).toReverse());
        }
        return new U128BE(buf.toReverse());
    }
    static fromHex(hex) {
        return new U128BE(FixedBuf.fromHex(16, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
export class U256BE extends FixedNum {
    constructor(buf) {
        if (typeof buf === "number") {
            buf = U256BE.fromN(buf).buf;
        }
        else if (typeof buf === "bigint") {
            buf = U256BE.fromBn(buf).buf;
        }
        super(buf);
    }
    static fromBn(bn) {
        const byteLen = 32;
        if (bn < 0 ||
            bn > 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn) {
            throw new Error("Invalid number");
        }
        const bytes = new Array(byteLen);
        for (let i = byteLen - 1; i >= 0; i--) {
            bytes[i] = Number(bn & 0xffn);
            bn >>= 8n; // Shift right by 8 bits in-place
        }
        return new U256BE(FixedBuf.fromBuf(byteLen, WebBuf.fromArray(bytes)));
    }
    static fromN(n) {
        return U256BE.fromBn(BigInt(n));
    }
    toBn() {
        const byteLen = 32;
        let result = 0n;
        for (let i = 0; i < byteLen; i++) {
            result = (result << 8n) + BigInt(this.buf.buf[i]);
        }
        return result;
    }
    add(other) {
        return U256BE.fromBn(this.toBn() + other.toBn());
    }
    sub(other) {
        return U256BE.fromBn(this.toBn() - other.toBn());
    }
    mul(other) {
        return U256BE.fromBn(this.toBn() * other.toBn());
    }
    div(other) {
        return U256BE.fromBn(this.toBn() / other.toBn());
    }
    toBEBuf() {
        return this.buf.clone();
    }
    toLEBuf() {
        return this.buf.toReverse();
    }
    toHex() {
        return this.buf.toHex();
    }
    static fromBEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U256BE(FixedBuf.fromBuf(32, buf));
        }
        return new U256BE(buf);
    }
    static fromLEBuf(buf) {
        if (buf instanceof WebBuf) {
            return new U256BE(FixedBuf.fromBuf(32, buf).toReverse());
        }
        return new U256BE(buf.toReverse());
    }
    static fromHex(hex) {
        return new U256BE(FixedBuf.fromHex(32, hex));
    }
    get n() {
        return Number(this.toBn());
    }
    get bn() {
        return this.toBn();
    }
}
