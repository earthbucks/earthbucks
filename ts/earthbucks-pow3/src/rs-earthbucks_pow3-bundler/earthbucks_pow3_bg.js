let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_0.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedFloat32ArrayMemory0 = null;

function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

const Pow3Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pow3_free(ptr >>> 0, 1));

export class Pow3 {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Pow3Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pow3_free(ptr, 0);
    }
    /**
     *
     *     * This is the reference implementation of EarthBucks Pow3. The purpose of writing this in rust
     *     * is twofold:
     *     * - Have a reference implementation with standardized test vectors for re-implementation in
     *     * WebGPU
     *     * - Be able to verify PoW solutions quickly on a CPU.
     *
     * @param {Uint8Array} header
     */
    constructor(header) {
        const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pow3_new(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        Pow3Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    set_nonce_from_header() {
        wasm.pow3_set_nonce_from_header(this.__wbg_ptr);
    }
    increment_nonce() {
        wasm.pow3_increment_nonce(this.__wbg_ptr);
    }
    set_working_header() {
        wasm.pow3_set_working_header(this.__wbg_ptr);
    }
    hash_working_header() {
        wasm.pow3_hash_working_header(this.__wbg_ptr);
    }
    fill_many_hash_1() {
        wasm.pow3_fill_many_hash_1(this.__wbg_ptr);
    }
    /**
     *
     *     * The next thing we want to do is as follows. We have generated two bits of data per element
     *     * in each matrix. What we want to do is to take each two bits, in big endian order, and
     *     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
     *     * fill them in from left to right. This function is for the first matrix. The next function is
     *     * for the second matrix.
     *
     */
    create_m1_from_many_hash_1() {
        wasm.pow3_create_m1_from_many_hash_1(this.__wbg_ptr);
    }
    create_m2_from_many_hash_1() {
        wasm.pow3_create_m2_from_many_hash_1(this.__wbg_ptr);
    }
    /**
     *
     *     * Now that we have the two matrices, we can multiply them together to get a third matrix. we
     *     * don't make any attempt to parallelize this operation. it will look different in wgsl.
     *
     */
    multiply_m1_times_m2_equals_m3() {
        wasm.pow3_multiply_m1_times_m2_equals_m3(this.__wbg_ptr);
    }
    /**
     *
     *     * now we want to include a simple floating point operation. so we multiply each u32 value in
     *     * the m3 matrix by 3.14 to get the m3_float matrix.
     *
     */
    multiply_m3_by_pi_to_get_m4() {
        wasm.pow3_multiply_m3_by_pi_to_get_m4(this.__wbg_ptr);
    }
    /**
     *
     *     * now before hashing the matrix, we need to convert it to bytes. we do this by taking each f32
     *     * value, and converting it to a u8 array of 4 bytes. we then store these bytes in big endian
     *     * in the m4_bytes array. this is a 65536 byte array. again, to prepare for parallelism of size
     *     * 256, we have an outer loop of 256, with an inner loop of whatever the remainder is.
     *
     */
    convert_m4_to_bytes() {
        wasm.pow3_convert_m4_to_bytes(this.__wbg_ptr);
    }
    /**
     *
     *     * now that we've got the m4 matrix in bytes, we are ready to hash it. now, as before, instead
     *     * of hashing this large value, which would be a giant serial operation, we want to hash it in
     *     * indepenent pieces so that it can be parallelized. our goal, as usual, is to have 256
     *     * simultaneous threads going on the gpu, so we need to break up the hashing into 256 separate
     *     * pieces. the simplest way to do this is to just run sha256 on each of 256 equal sized pieces.
     *     * after this stage, then there will be another stage hashing all those pieces together
     *     * (serially) for the final hash.
     *
     */
    create_many_hash_2_from_m4_bytes() {
        wasm.pow3_create_many_hash_2_from_m4_bytes(this.__wbg_ptr);
    }
    /**
     *
     *     * now that we've done a bunch of parallel hashes, we now have a piece of data that is 8192
     *     * bytes long, which is far shorter than the 65536 bytes from the previous stage, but not long
     *     * enough to justify hashing in parallel. so we just want one final serial hash on this data,
     *     * to produce final_hash_data
     *
     */
    create_final_hash_from_many_hash_2() {
        wasm.pow3_create_final_hash_from_many_hash_2(this.__wbg_ptr);
    }
    /**
     *
     *     * we're going to to need a method that looks at the output of the final hash and determines
     *     * whether the first 11 bits are zero. if the first 11 bits are zero, return true. otherwise,
     *     * return false.
     *     *
     *     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
     *     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
     *     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
     *     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
     *     * equals the total number of operations to actually perform the PoW, but where verifying it
     *     * requires only a small fraction (just one 128x128 matmul instead of 1627x1627).
     *
     */
    check_final_hash_starts_with_11_zeros() {
        wasm.pow3_check_final_hash_starts_with_11_zeros(this.__wbg_ptr);
    }
    /**
     * @returns {Uint8Array}
     */
    get_working_header() {
        const ret = wasm.pow3_get_working_header(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get_working_header_hash() {
        const ret = wasm.pow3_get_working_header_hash(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get_many_hash_1() {
        const ret = wasm.pow3_get_many_hash_1(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    get_m1() {
        const ret = wasm.pow3_get_m1(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    get_m2() {
        const ret = wasm.pow3_get_m2(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    get_m3() {
        const ret = wasm.pow3_get_m3(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Float32Array}
     */
    get_m4() {
        const ret = wasm.pow3_get_m4(this.__wbg_ptr);
        var v1 = getArrayF32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get_m4_bytes() {
        const ret = wasm.pow3_get_m4_bytes(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get_many_hash_2() {
        const ret = wasm.pow3_get_many_hash_2(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get_final_hash() {
        const ret = wasm.pow3_get_final_hash(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {boolean}
     */
    get_final_hash_starts_with_11_zeros() {
        const ret = wasm.pow3_get_final_hash_starts_with_11_zeros(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {number}
     */
    get_final_nonce() {
        const ret = wasm.pow3_get_final_nonce(this.__wbg_ptr);
        return ret >>> 0;
    }
}

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_export_0;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

