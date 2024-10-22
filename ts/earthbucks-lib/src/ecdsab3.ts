import { sign, verify } from "@earthbucks/secp256k1";
import { blake3_mac } from "@earthbucks/blake3";
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { FixedBuf, WebBuf } from "./buf.js";

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
  const k = blake3_mac(privKey.toBuf().buf, hashBuf.buf);
  const sig = sign(hashBuf.buf, privKey.toBuf().buf, k);
  return FixedBuf.fromBuf(64, WebBuf.from(sig));
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
  try {
    verify(sig.buf, hashBuf.buf, pubKey.toBuf().buf);
  } catch (e) {
    return false;
  }
  return true;
}
