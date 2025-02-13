import { acb3Encrypt, acb3Decrypt } from "./aescbc-blake3.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { sharedSecret } from "@webbuf/secp256k1";
import { Hash } from "./hash.js";

/**
 * Use Alice's private key and Bob's public key to derive a shared secret
 * (Diffie-Hellman) and use that shared secret at the encryption key for ACB3
 * encryption.
 *
 * @param alicePrivKey Alice's private key.
 * @param bobPubKey Bob's public key.
 * @param plaintext The data to encrypt.
 * @param iv The initialization vector to use. Must be 128 bits.
 * @returns The encrypted data.
 * @throws If there is an error encrypting the data.
 */
export function encrypt(
  alicePrivKey: PrivKey,
  bobPubKey: PubKey,
  plaintext: WebBuf,
  iv?: FixedBuf<16>,
) {
  const pubKey = sharedSecret(alicePrivKey.buf, bobPubKey.buf);
  const secret = Hash.blake3Hash(pubKey.buf);
  return acb3Encrypt(plaintext, secret, iv);
}

/**
 * Use Alice's private key and Bob's public key to derive a shared secret
 * (Diffie-Hellman) and use that shared secret at the decryption key for ACB3
 * decryption.
 *
 * @param alicePrivKey Alice's private key.
 * @param bobPubKey Bob's public key.
 * @param ciphertext The data to decrypt.
 * @returns The decrypted data.
 * @throws If there is an error decrypting the data.
 */
export function decrypt(
  alicePrivKey: PrivKey,
  bobPubKey: PubKey,
  ciphertext: WebBuf,
) {
  const pubKey = sharedSecret(alicePrivKey.buf, bobPubKey.buf);
  const secret = Hash.blake3Hash(pubKey.buf);
  return acb3Decrypt(ciphertext, secret);
}
