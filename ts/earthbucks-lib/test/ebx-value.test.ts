import { describe, expect, test, beforeEach, it } from "vitest";
import { EbxValue } from "../src/ebx-value.js";
import { U64 } from "../src/numbers.js";

describe("Value", () => {
  describe("toEBXNum", () => {
    it("should return the value divided by 10^11", () => {
      const value = new EbxValue(new U64(10 ** 11));
      expect(value.toEBX()).toBe(1);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(3)).toBe(1.1);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(2)).toBe(1.1);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(3)).toBe(1.1);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(4)).toBe(1.1);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(5)).toBe(1.09999);
    });

    it("should return the value divided by 10^11 rounded to the given decimal places", () => {
      const value = new EbxValue(new U64(1.09999 * 10 ** 11));
      expect(value.toEBX(6)).toBe(1.09999);
    });
  });
});
