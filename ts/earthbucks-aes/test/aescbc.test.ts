import * as CBC from "../src/aescbc.js";
import { cbc_vectors } from "./vectors-cbc.js";
import { expect, describe, it } from "vitest";
import { Buffer as SysBuf } from "buffer";

describe("AESCBC", () => {
  describe("@encrypt", () => {
    it("should return encrypt one block", () => {
      const cipherKeyBuf = SysBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = SysBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = SysBuf.alloc(128 / 8 - 1);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      expect(encBuf.length).toBe(128 / 8 + 128 / 8);
    });

    it("should return encrypt two blocks", () => {
      const cipherKeyBuf = SysBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = SysBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = SysBuf.alloc(128 / 8);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      expect(encBuf.length).toBe(128 / 8 + 128 / 8 + 128 / 8);
    });
  });

  describe("@decrypt", () => {
    it("should decrypt that which was encrypted", () => {
      const cipherKeyBuf = SysBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = SysBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = SysBuf.alloc(128 / 8);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      const messageBuf2 = CBC.decrypt(encBuf, cipherKeyBuf);
      expect(messageBuf2.toString("hex")).toBe(messageBuf.toString("hex"));
    });
  });

  describe("vectors", () => {
    cbc_vectors.forEach((vector, i) => {
      it(`should pass sjcl test vector ${i}`, () => {
        const keyBuf = SysBuf.from(vector.key, "hex");
        const ivBuf = SysBuf.from(vector.iv, "hex");
        const ptbuf = SysBuf.from(vector.pt, "hex");
        const ctBuf = SysBuf.from(vector.ct, "hex");
        expect(
          CBC.encrypt(ptbuf, keyBuf, ivBuf)
            .slice(128 / 8)
            .toString("hex"),
        ).toBe(vector.ct);
        expect(
          CBC.decrypt(SysBuf.concat([ivBuf, ctBuf]), keyBuf).toString("hex"),
        ).toBe(vector.pt);
      });
    });
  });
});
