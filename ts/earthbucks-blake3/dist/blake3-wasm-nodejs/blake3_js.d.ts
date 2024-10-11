/**
 * @param {Uint8Array} data
 * @param {Uint8Array} out
 */
export declare function hash(data: Uint8Array, out: Uint8Array): void;
/**
 * @returns {Blake3Hash}
 */
export declare const create_hasher: () => Blake3Hash;
/**
 * @param {Uint8Array} key_slice
 * @returns {Blake3Hash}
 */
declare const create_keyed: (key_slice: Uint8Array) => Blake3Hash;
export { create_keyed };
/**
 * @param {string} context
 * @returns {Blake3Hash}
 */
export declare const create_derive: (context: string) => Blake3Hash;
export declare class Blake3Hash {
    ptr: number;
    constructor(ptr: number);
    static __wrap(ptr: any): any;
    free(): void;
    /**
     * @returns {HashReader}
     */
    reader(): HashReader;
    /**
     * @param {Uint8Array} input_bytes
     */
    update(input_bytes: Uint8Array): void;
    /**
     * @param {Uint8Array} out
     */
    digest(out: Uint8Array): void;
}
export declare class HashReader {
    ptr: number;
    constructor(ptr: number);
    static __wrap(ptr: number): any;
    free(): void;
    /**
     * @param {Uint8Array} bytes
     */
    fill(bytes: Uint8Array): void;
    /**
     * @param {BigInt} position
     */
    set_position(position: bigint): void;
}
declare const __wbindgen_throw: (arg0: number, arg1: number) => never;
export { __wbindgen_throw };
