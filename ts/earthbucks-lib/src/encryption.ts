import {
  encrypt as aesCbcEncrypt,
  decrypt as aesCbcDecrypt,
} from "@earthbucks/aes";
import { Hash } from "./hash.js";
import { FixedBuf, SysBuf } from "./buf.js";

/**
 * Encrypt data with AES + CBC mode and a Blake3 MAC.
 *
 * ACB3 = AES + CBC + Blake3 Mac
 *
 * @param plaintext The data to encrypt. Can be any size.
 * @param aesKey The key to encrypt with. Must be 128, 192, or 256 bits.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @returns The encrypted data.
 * @throws If the encrypted data is less than 256+128+128 bits
 */
export function encrypt(
  plaintext: SysBuf,
  aesKey: FixedBuf<32>,
  iv?: FixedBuf<16>,
) {
  const ciphertext = aesCbcEncrypt(plaintext, aesKey.buf, iv?.buf);
  const hmacbuf = Hash.blake3Mac(aesKey, ciphertext);
  return SysBuf.concat([hmacbuf.buf, ciphertext]);
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
export function decrypt(ciphertext: SysBuf, aesKey: FixedBuf<32>) {
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
  return aesCbcDecrypt(ciphertext, aesKey.buf);
}
