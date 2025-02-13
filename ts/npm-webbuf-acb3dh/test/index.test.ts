import { describe, it, expect } from "vitest";
import { acb3dhEncrypt, acb3dhDecrypt } from "../src/index.js";
import { publicKeyCreate } from "@webbuf/secp256k1";
import { FixedBuf } from "@webbuf/fixedbuf";
import { WebBuf } from "@webbuf/webbuf";

describe("Index", () => {
  it("should exist", () => {
    expect(acb3dhEncrypt).toBeDefined();
    expect(acb3dhDecrypt).toBeDefined();
  });
});

describe("Encryption Tests", () => {
  it("should encrypt and decrypt", () => {
    const alicePrivKey = FixedBuf.fromRandom(32);
    const alicePubKey = publicKeyCreate(alicePrivKey);
    const bobPrivKey = FixedBuf.fromRandom(32);
    const bobPubKey = publicKeyCreate(bobPrivKey);
    const plaintext = WebBuf.fromString("hello world");
    const encrypted = acb3dhEncrypt(alicePrivKey, bobPubKey, plaintext);
    const decrypted = acb3dhDecrypt(bobPrivKey, alicePubKey, encrypted);
    expect(decrypted.toString()).toBe(plaintext.toString());
  });
});
