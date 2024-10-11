import { Buffer as SysBuf } from "buffer";
import wasmSrcBase64 from "./blake3-wasm-src.js";
const bytes = SysBuf.from(wasmSrcBase64, "base64");
const cachedTextDecoder = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true,
});
cachedTextDecoder.decode();
let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null ||
        cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}
function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
let WASM_VECTOR_LEN = 0;
// biome-ignore lint/suspicious:
function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
/**
 * @param {Uint8Array} data
 * @param {Uint8Array} out
 */
export function hash(data, out) {
    const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(out, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    wasm.hash(ptr0, len0, ptr1, len1);
    out.set(getUint8Memory0().subarray(ptr1 / 1, ptr1 / 1 + len1));
    wasm.__wbindgen_free(ptr1, len1 * 1);
}
/**
 * @returns {Blake3Hash}
 */
export const create_hasher = () => {
    const ret = wasm.create_hasher();
    return Blake3Hash.__wrap(ret);
};
/**
 * @param {Uint8Array} key_slice
 * @returns {Blake3Hash}
 */
const create_keyed = (key_slice) => {
    const ptr0 = passArray8ToWasm0(key_slice, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.create_keyed(ptr0, len0);
    return Blake3Hash.__wrap(ret);
};
export { create_keyed };
// biome-ignore lint/suspicious:
let cachegetNodeBufferMemory0 = null;
function getNodeBufferMemory0() {
    if (cachegetNodeBufferMemory0 === null ||
        cachegetNodeBufferMemory0.buffer !== wasm.memory.buffer) {
        cachegetNodeBufferMemory0 = SysBuf.from(wasm.memory.buffer);
    }
    return cachegetNodeBufferMemory0;
}
// biome-ignore lint/suspicious:
function passStringToWasm0(arg, malloc) {
    const len = SysBuf.byteLength(arg);
    const ptr = malloc(len);
    getNodeBufferMemory0().write(arg, ptr, len);
    WASM_VECTOR_LEN = len;
    return ptr;
}
/**
 * @param {string} context
 * @returns {Blake3Hash}
 */
export const create_derive = (context) => {
    const ptr0 = passStringToWasm0(context, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.create_derive(ptr0, len0);
    return Blake3Hash.__wrap(ret);
};
const u32CvtShim = new Uint32Array(2);
const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
export class Blake3Hash {
    ptr;
    constructor(ptr) {
        this.ptr = ptr;
    }
    // biome-ignore lint/suspicious:
    static __wrap(ptr) {
        const obj = Object.create(Blake3Hash.prototype);
        obj.ptr = ptr;
        return obj;
    }
    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        wasm.__wbg_blake3hash_free(ptr);
    }
    /**
     * @returns {HashReader}
     */
    reader() {
        const ret = wasm.blake3hash_reader(this.ptr);
        return HashReader.__wrap(ret);
    }
    /**
     * @param {Uint8Array} input_bytes
     */
    update(input_bytes) {
        const ptr0 = passArray8ToWasm0(input_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.blake3hash_update(this.ptr, ptr0, len0);
    }
    /**
     * @param {Uint8Array} out
     */
    digest(out) {
        const ptr0 = passArray8ToWasm0(out, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.blake3hash_digest(this.ptr, ptr0, len0);
        out.set(getUint8Memory0().subarray(ptr0 / 1, ptr0 / 1 + len0));
        wasm.__wbindgen_free(ptr0, len0 * 1);
    }
}
export class HashReader {
    ptr;
    constructor(ptr) {
        this.ptr = ptr;
    }
    static __wrap(ptr) {
        const obj = Object.create(HashReader.prototype);
        obj.ptr = ptr;
        return obj;
    }
    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        wasm.__wbg_hashreader_free(ptr);
    }
    /**
     * @param {Uint8Array} bytes
     */
    fill(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.hashreader_fill(this.ptr, ptr0, len0);
        bytes.set(getUint8Memory0().subarray(ptr0 / 1, ptr0 / 1 + len0));
        wasm.__wbindgen_free(ptr0, len0 * 1);
    }
    /**
     * @param {BigInt} position
     */
    set_position(position) {
        uint64CvtShim[0] = position;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.hashreader_set_position(this.ptr, low0, high0);
    }
}
const __wbindgen_throw = (arg0, arg1) => {
    throw new Error(getStringFromWasm0(arg0, arg1));
};
export { __wbindgen_throw };
const wasmModule = new WebAssembly.Module(bytes);
const imports = {
    __wbindgen_placeholder__: {
        hash,
        create_hasher,
        create_keyed,
        create_derive,
        Blake3Hash,
        HashReader,
        __wbindgen_throw,
    },
};
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
// biome-ignore lint/suspicious:
const wasm = wasmInstance.exports;
