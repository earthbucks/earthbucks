import { expect, describe, it } from "vitest";
import { aescbcEncrypt, aescbcDecrypt } from "../src/index.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";
import vectors from "../vectors/vectors-cbc.json";

describe("aescbc", () => {
  it("should encrypt and decrypt", () => {
    const key = FixedBuf.fromHex(
      32,
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    );
    const plaintext = WebBuf.fromUtf8("Hello, world!");
    const iv = FixedBuf.fromHex(16, "000102030405060708090a0b0c0d0e0f");
    const ciphertext = aescbcEncrypt(plaintext, key, iv);
    const decrypted = aescbcDecrypt(ciphertext, key);
    expect(decrypted.toUtf8()).toEqual("Hello, world!");
  });

  describe("vectors", () => {
    for (const vector of vectors) {
      // {
      // 	"key": "654a1661a99a6b3abf52e52a4e951491",
      // 	"iv": "bfd3814678afe0036efa67ca8da44e2e",
      // 	"pt": "",
      // 	"ct": "ac5517ed8b3118ae7bd90a81891cbeb5"
      // },
      it("should encrypt and decrypt vector", () => {
        let key: FixedBuf<16> | FixedBuf<24> | FixedBuf<32>;
        if (vector.key.length === 32) {
          key = FixedBuf.fromHex(16, vector.key);
        } else if (vector.key.length === 48) {
          key = FixedBuf.fromHex(24, vector.key);
        } else {
          key = FixedBuf.fromHex(32, vector.key);
        }
        const iv = FixedBuf.fromHex(16, vector.iv);
        const plaintext = WebBuf.fromHex(vector.pt);
        const ciphertext = aescbcEncrypt(plaintext, key, iv);
        const decrypted = aescbcDecrypt(ciphertext, key);
        expect(decrypted.toHex()).toEqual(vector.pt);

        const ct = WebBuf.concat([iv.buf, WebBuf.fromHex(vector.ct)]);
        const decryptedCt = aescbcDecrypt(ct, key);
        expect(decryptedCt.toHex()).toEqual(vector.pt);
      });
    }
  });
});
