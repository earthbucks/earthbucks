import { blake3_hash, double_blake3_hash, blake3_mac, } from "./rs-webbuf_blake3-inline-base64/webbuf_blake3.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
export function blake3Hash(buf) {
    const hash = blake3_hash(buf);
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(hash));
}
export function doubleBlake3Hash(buf) {
    const hash = double_blake3_hash(buf);
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(hash));
}
export function blake3Mac(key, message) {
    const mac = blake3_mac(key.buf, message);
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(mac));
}
