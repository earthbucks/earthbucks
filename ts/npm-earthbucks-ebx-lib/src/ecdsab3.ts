import { sign, verify } from "@webbuf/secp256k1";
import { Hash } from "./hash.js";
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { FixedBuf } from "@webbuf/fixedbuf";

/**
 * Sign a message with ECDSA on the secp256k1 curve using a blake3 MAC as the
 * deterministic k value.
 *
 * @param hashBuf The hash of the message to sign.
 * @param privKey The private key to sign with.
 * @returns The signature.
 */
export function ecdsab3Sign(
  hashBuf: FixedBuf<32>,
  privKey: PrivKey,
): FixedBuf<64> {
  const k = Hash.blake3Mac(privKey.toBuf(), hashBuf.buf);
  const sig = sign(hashBuf, privKey.toBuf(), k);
  return sig;
}

/**
 * Verify a message with ECDSA on the secp256k1 curve using a blake3 MAC as the
 * deterministic k value.
 *
 * @param sig The signature to verify.
 * @param hashBuf The hash of the message to verify.
 * @param pubKey The public key to verify with.
 * @returns True if the signature is valid.
 */
export function ecdsab3Verify(
  sig: FixedBuf<64>,
  hashBuf: FixedBuf<32>,
  pubKey: PubKey,
): boolean {
  return verify(sig, hashBuf, pubKey.toBuf());
}
