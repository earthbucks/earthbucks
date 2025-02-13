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
export declare function aescbcEncrypt(plaintext: WebBuf, aesKey: FixedBuf<16> | FixedBuf<24> | FixedBuf<32>, iv?: FixedBuf<16>): WebBuf;
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
export declare function aescbcDecrypt(ciphertext: WebBuf, aesKey: FixedBuf<16> | FixedBuf<24> | FixedBuf<32>): WebBuf;
