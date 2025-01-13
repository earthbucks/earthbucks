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
/**
 * @param {Uint8Array} header
 * @param {boolean} reset_nonce
 * @returns {Pow2}
 */
export function create_pow2(header, reset_nonce) {
    const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.create_pow2(ptr0, len0, reset_nonce);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return Pow2.__wrap(ret[0]);
}

/**
 * @param {Uint8Array} input
 * @returns {Uint8Array}
 */
export function sha256(input) {
    const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.sha256(ptr0, len0);
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
}

const Pow2Finalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pow2_free(ptr >>> 0, 1));

export class Pow2 {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pow2.prototype);
        obj.__wbg_ptr = ptr;
        Pow2Finalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        Pow2Finalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pow2_free(ptr, 0);
    }
    /**
     *
     *     * This is the reference implementation of EarthBucks Pow2. The purpose of writing this in rust
     *     * is twofold:
     *     * - Have a reference implementation with standardized test vectors for re-implementation in
     *     * WebGPU
     *     * - Be able to verify PoW solutions quickly on a CPU.
     *
     * @param {Uint8Array} header
     * @param {boolean} reset_nonce
     */
    constructor(header, reset_nonce) {
        const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pow2_new(ptr0, len0, reset_nonce);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        Pow2Finalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     *
     *     * This uses the nonce to hash the header over and over, 64 times, and produce a very long
     *     * piece of data which we will turn into two pseudo-random matrices which we later multiply
     *     * together.
     *
     */
    create_matrix_data_from_hashes() {
        wasm.pow2_create_matrix_data_from_hashes(this.__wbg_ptr);
    }
    /**
     *
     *     * The next thing we want to do is as follows. We have generated two bits of data per element
     *     * in each matrix. What we want to do is to take each two bits, in big endian order, and
     *     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
     *     * fill them in from left to right.
     *
     */
    fill_in_matrices_from_data() {
        wasm.pow2_fill_in_matrices_from_data(this.__wbg_ptr);
    }
    /**
     *
     *     * Now that we have the two matrices, we can multiply them together to get a third matrix.
     *
     */
    multiply_m1_times_m2_equals_m3() {
        wasm.pow2_multiply_m1_times_m2_equals_m3(this.__wbg_ptr);
    }
    /**
     *
     *     * now we want to include a simple floating point operation. so we multiply each u32 value in
     *     * the m3 matrix by 3.14 to get the m3_float matrix
     *
     */
    multiply_m3_by_pi_to_get_m4() {
        wasm.pow2_multiply_m3_by_pi_to_get_m4(this.__wbg_ptr);
    }
    /**
     *
     *     * now that we have the result of the matrix multiplication, and we've converted that matrix
     *     * (m3) into a float matrix (m4), by multiplying it by 3.14, now we want to convert each one of
     *     * these floating point values into a byte representation. we use big-endian representation.
     *
     */
    convert_m4_to_bytes() {
        wasm.pow2_convert_m4_to_bytes(this.__wbg_ptr);
    }
    /**
     *
     *     * Now that we have the result of the matrix multiplication, and performed one floating point
     *     * operation, we want to perform the sha256 hash of the output matrix (m4).
     *
     */
    hash_m4() {
        wasm.pow2_hash_m4(this.__wbg_ptr);
    }
    /**
     *
     *     * now we're getting ready to run the full algorithm. but first, we're going to to need a
     *     * method that looks at the output of the hash, m4_hash, and determines whether the first 11
     *     * bits are zero. if the first 11 bits are zero, return true. otherwise, return false.
     *     *
     *     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
     *     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
     *     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
     *     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
     *     * equals the total number of operations to actually perform the PoW, but where verifying it
     *     * requires only a small fraction (just one 128x128 matmul).
     *
     * @returns {boolean}
     */
    check_m4_hash_11_bits() {
        const ret = wasm.pow2_check_m4_hash_11_bits(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     *
     *     * now let's put all the methods in order and run a single full-iteration of the pow algo
     *
     */
    run_single_iteration() {
        wasm.pow2_run_single_iteration(this.__wbg_ptr);
    }
    /**
     *
     *     * now we are ready to perform the full proof-of-work algorithm. we want to iterate the nonce
     *     * as many times as it takes for check_m4_hash to return true. when it does, we want to set the
     *     * final_nonce to the current nonce.
     *
     */
    run_full_pow() {
        wasm.pow2_run_full_pow(this.__wbg_ptr);
    }
    /**
     *
     *     * suppose we have a successful run. we need a method to get the header with the final nonce in
     *     * it.
     *
     * @returns {Uint8Array}
     */
    get_header_with_final_nonce() {
        const ret = wasm.pow2_get_header_with_final_nonce(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     *
     *     * now suppose we receive a header from somewhere, and we want to verify the pow. we should be
     *     * able to hash it, using the nonce already included in the header, and then run the full pow
     *     * algorithm, just one iteration, to verify the hash passes the check_m4_hash_11_bits method.
     *
     * @param {Uint8Array} header
     * @returns {boolean}
     */
    static verify_pow(header) {
        const ptr0 = passArray8ToWasm0(header, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pow2_verify_pow(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
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

