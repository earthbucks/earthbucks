import { WebBuf } from "@webbuf/webbuf";
export class FixedBuf {
    _buf;
    _size;
    constructor(size, buf) {
        if (buf.length !== size) {
            throw new Error("invalid size error");
        }
        this._buf = buf;
        this._size = size;
    }
    get buf() {
        return this._buf;
    }
    static fromBuf(size, buf) {
        return new FixedBuf(size, buf);
    }
    static alloc(size, fill) {
        const buf = WebBuf.alloc(size, fill);
        return FixedBuf.fromBuf(size, buf);
    }
    static fromHex(size, hex) {
        const buf = WebBuf.from(hex, "hex");
        return FixedBuf.fromBuf(size, buf);
    }
    toHex() {
        return this._buf.toString("hex");
    }
    static fromBase64(size, base64) {
        try {
            const buf = WebBuf.from(base64, "base64");
            return FixedBuf.fromBuf(size, buf);
        }
        catch (err) {
            throw new Error("invalid encoding");
        }
    }
    toBase64() {
        return this._buf.toString("base64");
    }
    static fromRandom(size) {
        const buf = crypto.getRandomValues(WebBuf.alloc(size));
        return FixedBuf.fromBuf(size, buf);
    }
    clone() {
        return FixedBuf.fromBuf(this._size, WebBuf.from(this._buf));
    }
    toReverse() {
        const cloneedReverse = this._buf.toReverse();
        return FixedBuf.fromBuf(this._size, cloneedReverse);
    }
}
