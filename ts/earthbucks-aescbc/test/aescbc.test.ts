import * as CBC from "../src/aescbc.js";
import { cbc_vectors } from "./vectors-cbc.js";
import { expect, describe, it } from "vitest";
import { WebBuf } from "webbuf";

describe("AESCBC", () => {
  describe("@encrypt", () => {
    it("should return encrypt one block", () => {
      const cipherKeyBuf = WebBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = WebBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = WebBuf.alloc(128 / 8 - 1);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      expect(encBuf.length).toBe(128 / 8 + 128 / 8);
    });

    it("should return encrypt two blocks", () => {
      const cipherKeyBuf = WebBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = WebBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = WebBuf.alloc(128 / 8);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      expect(encBuf.length).toBe(128 / 8 + 128 / 8 + 128 / 8);
    });
  });

  describe("@decrypt", () => {
    it("should decrypt that which was encrypted", () => {
      const cipherKeyBuf = WebBuf.alloc(256 / 8);
      cipherKeyBuf.fill(0x10);
      const ivBuf = WebBuf.alloc(128 / 8);
      ivBuf.fill(0);
      const messageBuf = WebBuf.alloc(128 / 8);
      messageBuf.fill(0);
      const encBuf = CBC.encrypt(messageBuf, cipherKeyBuf, ivBuf);
      const messageBuf2 = CBC.decrypt(encBuf, cipherKeyBuf);
      expect(messageBuf2.toString("hex")).toBe(messageBuf.toString("hex"));
    });
  });

  describe("vectors", () => {
    cbc_vectors.forEach((vector, i) => {
      it(`should pass sjcl test vector ${i}`, () => {
        const keyBuf = WebBuf.from(vector.key, "hex");
        const ivBuf = WebBuf.from(vector.iv, "hex");
        const ptbuf = WebBuf.from(vector.pt, "hex");
        const ctBuf = WebBuf.from(vector.ct, "hex");
        expect(
          CBC.encrypt(ptbuf, keyBuf, ivBuf)
            .slice(128 / 8)
            .toString("hex"),
        ).toBe(vector.ct);
        expect(
          CBC.decrypt(WebBuf.concat([ivBuf, ctBuf]), keyBuf).toString("hex"),
        ).toBe(vector.pt);
      });
    });
  });
});
