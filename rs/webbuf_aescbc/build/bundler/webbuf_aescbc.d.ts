/* tslint:disable */
/* eslint-disable */
/**
 * @param {Uint8Array} plaintext
 * @param {Uint8Array} aes_key
 * @param {Uint8Array} iv
 * @returns {Uint8Array}
 */
export function aescbc_encrypt(plaintext: Uint8Array, aes_key: Uint8Array, iv: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} aes_key
 * @param {Uint8Array} iv
 * @returns {Uint8Array}
 */
export function aescbc_decrypt(ciphertext: Uint8Array, aes_key: Uint8Array, iv: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} key
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function aes_encrypt(key: Uint8Array, data: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} key
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
export function aes_decrypt(key: Uint8Array, data: Uint8Array): Uint8Array;
