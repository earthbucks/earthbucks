import {
  aescbc_decrypt,
  aescbc_encrypt,
} from "./rs-webbuf_aescbc-inline-base64/webbuf_aescbc.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

/**
 * Encrypts a plaintext using AES-CBC with the provided key and IV.
 * If the IV is not provided, a random IV is generated.
 * @param plaintext The plaintext to encrypte
 * @param aesKey The AES key to use
 * @param iv The IV to use (optional)
 * @returns The encrypted ciphertext
 * @throws If the keys are not the correct length
 */
export function aescbcEncrypt(
  plaintext: WebBuf,
  aesKey: FixedBuf<16> | FixedBuf<24> | FixedBuf<32>,
  iv: FixedBuf<16> = FixedBuf.fromRandom(16),
): WebBuf {
  const encrypted = aescbc_encrypt(plaintext, aesKey.buf, iv.buf);
  return WebBuf.concat([iv.buf, WebBuf.fromUint8Array(encrypted)]);
}

/**
 * Decrypts a ciphertext using AES-CBC with the provided key and IV.
 * If the IV is not provided, the first 16 bytes of the ciphertext are used.
 * @param ciphertext The ciphertext to decrypt
 * @param aesKey The AES key to use
 * @param iv The IV to use
 * @returns The decrypted plaintext
 * @throws If the data is not a multiple of 16 bytes
 * @throws If the data is less than 16 bytes long and no IV is provided
 */
export function aescbcDecrypt(
  ciphertext: WebBuf,
  aesKey: FixedBuf<16> | FixedBuf<24> | FixedBuf<32>,
): WebBuf {
  if (ciphertext.length < 16) {
    throw new Error("Data must be at least 16 bytes long");
  }
  const iv = FixedBuf.fromBuf(16, ciphertext.slice(0, 16));
  ciphertext = ciphertext.slice(16);
  if (ciphertext.length % 16 !== 0) {
    throw new Error("Data length must be a multiple of 16");
  }

  return WebBuf.fromUint8Array(aescbc_decrypt(ciphertext, aesKey.buf, iv.buf));
}
