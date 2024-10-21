import { sign, verify } from "@earthbucks/secp256k1";
import { blake3_mac } from "@earthbucks/blake3";
import { PrivKey } from "./priv-key.js";
import { PubKey } from "./pub-key.js";
import { FixedBuf, SysBuf } from "./buf.js";

export function ecdsa_sign(
  hashBuf: FixedBuf<32>,
  privKey: PrivKey,
): FixedBuf<64> {
  const k = blake3_mac(privKey.toBuf().buf, hashBuf.buf);
  const sig = sign(hashBuf.buf, privKey.toBuf().buf, k);
  return FixedBuf.fromBuf(64, SysBuf.from(sig));
}

export function ecdsa_verify(
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
