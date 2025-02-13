import { insert_nonce, get_work_par, elementary_iteration, } from "./rs-earthbucks_pow5-inline-base64/earthbucks_pow5.js";
import { FixedBuf, WebBuf } from "@earthbucks/ebx-lib";
export function insertNonce(header, nonce) {
    const res = WebBuf.fromUint8Array(insert_nonce(header.buf, nonce));
    return FixedBuf.fromBuf(217, res);
}
export function getWorkPar(header) {
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(get_work_par(header.buf)));
}
export function elementaryIteration(header) {
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(elementary_iteration(header.buf)));
}
