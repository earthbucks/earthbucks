export function __wbg_set_wasm(val: any): void;
/**
 * @param {Uint8Array} priv_key_buf
 * @returns {boolean}
 */
export function private_key_verify(priv_key_buf: Uint8Array): boolean;
/**
 * @param {Uint8Array} pub_key_buf
 * @returns {boolean}
 */
export function public_key_verify(pub_key_buf: Uint8Array): boolean;
/**
 * @param {Uint8Array} priv_key_buf
 * @returns {Uint8Array}
 */
export function public_key_create(priv_key_buf: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} priv_key_buf_1
 * @param {Uint8Array} priv_key_buf_2
 * @returns {Uint8Array}
 */
export function private_key_add(priv_key_buf_1: Uint8Array, priv_key_buf_2: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} pub_key_buf_1
 * @param {Uint8Array} pub_key_buf_2
 * @returns {Uint8Array}
 */
export function public_key_add(pub_key_buf_1: Uint8Array, pub_key_buf_2: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} hash_buf
 * @param {Uint8Array} priv_key_buf
 * @param {Uint8Array} k_buf
 * @returns {Uint8Array}
 */
export function sign(hash_buf: Uint8Array, priv_key_buf: Uint8Array, k_buf: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} sig_buf
 * @param {Uint8Array} hash_buf
 * @param {Uint8Array} pub_key_buf
 */
export function verify(sig_buf: Uint8Array, hash_buf: Uint8Array, pub_key_buf: Uint8Array): void;
/**
 * @param {Uint8Array} priv_key_buf
 * @param {Uint8Array} pub_key_buf
 * @returns {Uint8Array}
 */
export function shared_secret(priv_key_buf: Uint8Array, pub_key_buf: Uint8Array): Uint8Array;
export function __wbindgen_string_new(arg0: any, arg1: any): number;
