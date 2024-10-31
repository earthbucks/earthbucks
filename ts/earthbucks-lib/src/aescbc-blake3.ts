import { aescbcEncrypt, aescbcDecrypt } from "@webbuf/aescbc";
import { Hash } from "./hash.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

/**
 * Encrypt data with AES + CBC mode and a Blake3 MAC. Good for small amounts of
 * data, such as a short text message.
 *
 * ACB3 = AES + CBC + Blake3 Mac
 *
 * @param plaintext The data to encrypt. Can be any size.
 * @param aesKey The key to encrypt with. Must be 128, 192, or 256 bits.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @returns The encrypted data.
 * @throws If the encrypted data is less than 256+128+128 bits
 */
export function acb3Encrypt(
  plaintext: WebBuf,
  aesKey: FixedBuf<32>,
  iv?: FixedBuf<16>,
) {
  const ciphertext = aescbcEncrypt(plaintext, aesKey, iv);
  const hmacbuf = Hash.blake3Mac(aesKey, ciphertext);
  return WebBuf.concat([hmacbuf.buf, ciphertext]);
}

/**
 * Decrypt data with AES + CBC mode and a Blake3 MAC.
 *
 * ACB3 = AES + CBC + Blake3 Mac
 *
 * @param ciphertext The data to decrypt. Can be any size.
 * @param aesKey The key to decrypt with. Must be 128, 192, or 256 bits.
 * @returns The decrypted data.
 * @throws If the encrypted data is less than 256+128+128 bits
 * @throws If the Hmacs are not equivalent
 */
export function acb3Decrypt(ciphertext: WebBuf, aesKey: FixedBuf<32>) {
  if (ciphertext.length < (256 + 128 + 128) / 8) {
    throw new Error(
      "The encrypted data must be at least 256+128+128 bits, which is the length of the Hmac plus the iv plus the smallest encrypted data size",
    );
  }
  const hmacbuf = ciphertext.slice(0, 256 / 8);
  ciphertext = ciphertext.slice(256 / 8, ciphertext.length);
  const hmacbuf2 = Hash.blake3Mac(aesKey, ciphertext);
  if (!hmacbuf.equals(hmacbuf2.buf)) {
    throw new Error("Message authentication failed Hmacs are not equivalent");
  }
  return aescbcDecrypt(ciphertext, aesKey);
}
