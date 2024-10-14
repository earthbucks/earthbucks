/* tslint:disable */
/* eslint-disable */
/**
 * @param {Uint8Array} priv_key_buf
 * @returns {boolean}
 */
export function private_key_verify(priv_key_buf: Uint8Array): boolean;
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
 * @param {Uint8Array} digest
 * @param {Uint8Array} priv_key_buf
 * @returns {Uint8Array}
 */
export function ecdsa_sign(digest: Uint8Array, priv_key_buf: Uint8Array): Uint8Array;
/**
 * @param {Uint8Array} sig_buf
 * @param {Uint8Array} digest
 * @param {Uint8Array} pub_key_buf
 * @returns {boolean}
 */
export function ecdsa_verify(sig_buf: Uint8Array, digest: Uint8Array, pub_key_buf: Uint8Array): boolean;
