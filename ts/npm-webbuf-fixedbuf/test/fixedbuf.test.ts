import { describe, it, expect } from "vitest";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "../src/fixedbuf.js";

describe("FixedBuf", () => {
  describe("to/from hex", () => {
    it("should convert to and from hex", () => {
      const hex = "deadbeef";
      const buf = FixedBuf.fromHex(4, hex);
      expect(buf.toHex()).toBe(hex);
    });
  });

  describe("to/from base64", () => {
    it("should convert to and from base64", () => {
      const base64 = "3q2+7w==";
      const buf = FixedBuf.fromBase64(4, base64);
      expect(buf.toBase64()).toBe(base64);
    });
  });

  describe("create new buffer", () => {
    it("should create a new buffer", () => {
      const buf = FixedBuf.alloc(4);
      expect(buf.buf.length).toBe(4);
    });

    it("should create a new FixedBuf from a WebBuf", () => {
      const buf = WebBuf.alloc(4);
      const fixedBuf = FixedBuf.fromBuf(4, buf);
      expect(fixedBuf.buf.length).toBe(4);
    });

    it("should not create a new FixedBuf from a WebBuf with the wrong size", () => {
      const buf = WebBuf.alloc(4);
      expect(() => FixedBuf.fromBuf(5, buf)).toThrow();
    });
  });
});
