import { describe, it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import {
  sign,
  verify,
  sharedSecret,
  publicKeyAdd,
  publicKeyCreate,
  publicKeyVerify,
  privateKeyAdd,
} from "../src/index.js";
import { blake3Hash } from "@webbuf/blake3";

describe("secp256k1", () => {
  it("should correctly sign and verify a message", () => {
    const privateKey = FixedBuf.fromRandom(32);
    const publicKey = publicKeyCreate(privateKey);
    const message = WebBuf.fromString("test message");
    const digest = blake3Hash(message);
    const signature = sign(digest, privateKey, FixedBuf.fromRandom(32));
    expect(verify(signature, digest, publicKey)).toBe(true);
  });

  it("should correctly not verify an invalid signature", () => {
    const privateKey = FixedBuf.fromRandom(32);
    const publicKey = publicKeyCreate(privateKey);
    const message = WebBuf.fromString("test message");
    const digest = blake3Hash(message);
    //const signature = sign(digest, privateKey, FixedBuf.fromRandom(32));
    const invalidSignature = FixedBuf.fromRandom(64);
    expect(verify(invalidSignature, digest, publicKey)).toBe(false);
  });

  it("should correctly compute shared secret", () => {
    const privKey1 = FixedBuf.fromRandom(32);
    const privKey2 = FixedBuf.fromRandom(32);
    const pubKey1 = publicKeyCreate(privKey1);
    const pubKey2 = publicKeyCreate(privKey2);
    const shared1 = sharedSecret(privKey1, pubKey2);
    const shared2 = sharedSecret(privKey2, pubKey1);
    expect(shared1.toHex()).toBe(shared2.toHex());
  });

  it("should correctly add public keys", () => {
    const privKey1 = FixedBuf.fromRandom(32);
    const privKey2 = FixedBuf.fromRandom(32);
    const pubKey1 = publicKeyCreate(privKey1);
    const pubKey2 = publicKeyCreate(privKey2);
    const sum = publicKeyAdd(pubKey1, pubKey2);
    expect(publicKeyVerify(sum)).toBe(true);
  });

  it("should correctly add private keys", () => {
    const privKey1 = FixedBuf.fromRandom(32);
    const privKey2 = FixedBuf.fromRandom(32);
    const sum = privateKeyAdd(privKey1, privKey2);
    expect(publicKeyVerify(publicKeyCreate(sum))).toBe(true);
  });
});
