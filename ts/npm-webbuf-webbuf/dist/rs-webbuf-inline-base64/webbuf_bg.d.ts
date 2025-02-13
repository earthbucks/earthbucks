export function __wbg_set_wasm(val: any): void;
/**
 * Encode a byte slice into a base64 string using the default engine
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode_base64(data: Uint8Array): string;
/**
 * Decode a base64 string into a byte vector
 * Returns an error string if decoding fails
 * @param {string} encoded
 * @returns {Uint8Array}
 */
export function decode_base64_strip_whitespace(encoded: string): Uint8Array;
/**
 * @param {string} encoded
 * @returns {Uint8Array}
 */
export function decode_base64(encoded: string): Uint8Array;
/**
 * Encode a byte slice into a hex string
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode_hex(data: Uint8Array): string;
/**
 * Decode a hex string into a byte vector
 * Returns an error string if decoding fails
 * @param {string} encoded
 * @returns {Uint8Array}
 */
export function decode_hex(encoded: string): Uint8Array;
export function __wbindgen_string_new(arg0: any, arg1: any): number;
