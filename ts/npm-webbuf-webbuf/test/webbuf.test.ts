import { describe, it, expect } from "vitest";
import { WebBuf } from "../src/webbuf.js";

describe("WebBuf", () => {
  describe("to/from hex/base64 algo threshold", () => {
    it.skip("should hande algo threshold for to hex", () => {
      const TO_HEX_ALGO_THRESHOLD = WebBuf.TO_HEX_ALGO_THRESHOLD;
      const smallBufLength = TO_HEX_ALGO_THRESHOLD - 1;
      const largeBufLength = TO_HEX_ALGO_THRESHOLD + 1;
      const smallBuf = WebBuf.alloc(smallBufLength);
      const largeBuf = WebBuf.alloc(largeBufLength);
      for (let i = 0; i < smallBufLength; i++) {
        const val = i % 256;
        smallBuf[i] = val;
      }
      for (let i = 0; i < largeBufLength; i++) {
        const val = i % 255;
        largeBuf[i] = val;
      }
      const smallHex = smallBuf.toHex();
      const largeHex = largeBuf.toHex();
      const fromSmallHex = WebBuf.fromHex(smallHex);
      const fromLargeHex = WebBuf.fromHex(largeHex);
      expect(fromSmallHex.toHex()).toBe(smallHex);
      expect(fromLargeHex.toHex()).toBe(largeHex);
    });

    it("should handle algo threshold for from hex", () => {
      const FROM_HEX_ALGO_THRESHOLD = WebBuf.FROM_HEX_ALGO_THRESHOLD;
      const smallBufLength = FROM_HEX_ALGO_THRESHOLD - 1;
      const largeBufLength = FROM_HEX_ALGO_THRESHOLD + 1;
      const smallBuf = WebBuf.alloc(smallBufLength);
      const largeBuf = WebBuf.alloc(largeBufLength);
      for (let i = 0; i < smallBufLength; i++) {
        const val = i % 256;
        smallBuf[i] = val;
      }
      for (let i = 0; i < largeBufLength; i++) {
        const val = i % 255;
        largeBuf[i] = val;
      }
      const smallHex = smallBuf.toHex();
      const largeHex = largeBuf.toHex();
      const fromSmallHex = WebBuf.fromHex(smallHex);
      const fromLargeHex = WebBuf.fromHex(largeHex);
      expect(fromSmallHex.toHex()).toBe(smallHex);
      expect(fromLargeHex.toHex()).toBe(largeHex);
    });

    it.skip("should hande algo threshold for to base64", () => {
      const TO_BASE64_ALGO_THRESHOLD = WebBuf.TO_BASE64_ALGO_THRESHOLD;
      const smallBufLength = TO_BASE64_ALGO_THRESHOLD - 1;
      const largeBufLength = TO_BASE64_ALGO_THRESHOLD + 1;
      const smallBuf = WebBuf.alloc(smallBufLength);
      const largeBuf = WebBuf.alloc(largeBufLength);
      for (let i = 0; i < smallBufLength; i++) {
        const val = i % 256;
        smallBuf[i] = val;
      }
      for (let i = 0; i < largeBufLength; i++) {
        const val = i % 255;
        largeBuf[i] = val;
      }
      const smallBase64 = smallBuf.toBase64();
      const largeBase64 = largeBuf.toBase64();
      const fromSmallBase64 = WebBuf.fromBase64(smallBase64);
      const fromLargeBase64 = WebBuf.fromBase64(largeBase64);
      expect(fromSmallBase64.toBase64()).toBe(smallBase64);
      expect(fromLargeBase64.toBase64()).toBe(largeBase64);
    });

    it.skip("should handle algo threshold for from base64", () => {
      const FROM_BASE64_ALGO_THRESHOLD = WebBuf.FROM_BASE64_ALGO_THRESHOLD;
      const smallBufLength = FROM_BASE64_ALGO_THRESHOLD - 1;
      const largeBufLength = FROM_BASE64_ALGO_THRESHOLD + 1;
      const smallBuf = WebBuf.alloc(smallBufLength);
      const largeBuf = WebBuf.alloc(largeBufLength);
      for (let i = 0; i < smallBufLength; i++) {
        const val = i % 256;
        smallBuf[i] = val;
      }
      for (let i = 0; i < largeBufLength; i++) {
        const val = i % 255;
        largeBuf[i] = val;
      }
      const smallBase64 = smallBuf.toBase64();
      const largeBase64 = largeBuf.toBase64();
      const fromSmallBase64 = WebBuf.fromBase64(smallBase64);
      const fromLargeBase64 = WebBuf.fromBase64(largeBase64);
      expect(fromSmallBase64.toBase64()).toBe(smallBase64);
      expect(fromLargeBase64.toBase64()).toBe(largeBase64);
    });
  });

  describe("compare", () => {
    it("should pass these known test vectors", () => {
      const b = WebBuf.fromUtf8("a");
      const c = WebBuf.fromUtf8("c");
      const d = WebBuf.fromUtf8("aa");

      expect(b.compare(c)).toBe(-1);
      expect(c.compare(d)).toBe(1);
      expect(d.compare(b)).toBe(1);
      expect(b.compare(d)).toBe(-1);
      expect(b.compare(b)).toBe(0);

      expect(WebBuf.compare(b, c)).toBe(-1);
      expect(WebBuf.compare(c, d)).toBe(1);
      expect(WebBuf.compare(d, b)).toBe(1);
      expect(WebBuf.compare(b, d)).toBe(-1);
      expect(WebBuf.compare(c, c)).toBe(0);
      expect(WebBuf.compare(d, b)).toBe(1);

      expect(WebBuf.compare(WebBuf.alloc(0), WebBuf.alloc(0))).toBe(0);
      expect(WebBuf.compare(WebBuf.alloc(0), WebBuf.alloc(1))).toBe(-1);
      expect(WebBuf.compare(WebBuf.alloc(1), WebBuf.alloc(0))).toBe(1);
    });
  });

  describe("from", () => {
    it("should convert from hex", () => {
      const webBuf = WebBuf.from("deadbeef", "hex");
      expect(webBuf.toHex()).toBe("deadbeef");
      expect(webBuf instanceof WebBuf).toBe(true);
    });
  });

  describe("slice", () => {
    it("should slice a buffer", () => {
      const webBuf = WebBuf.from("deadbeef", "hex");
      const sliced = webBuf.slice(1, 3);
      expect(sliced.toHex()).toBe("adbe");
      expect(sliced instanceof WebBuf).toBe(true);
    });
  });

  describe("subarray", () => {
    it("should subarray a buffer", () => {
      const webBuf = WebBuf.from("deadbeef", "hex");
      const subarray = webBuf.subarray(1, 3);
      expect(subarray.toHex()).toBe("adbe");
      expect(subarray instanceof WebBuf).toBe(true);
    });
  });

  describe("base64", () => {
    it("should encode and decode base64", () => {
      const myStr = "Hello, World!";
      const buf = WebBuf.fromUtf8(myStr);
      const base64 = buf.toBase64();
      const decoded = WebBuf.fromBase64(base64);
      expect(decoded.toUtf8()).toBe(myStr);
    });

    it("should encode and decode arbitrary binary data", () => {
      const hex =
        "000102030405060708090a0b0c0d0e0ff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff";
      const buf = WebBuf.fromHex(hex);
      const base64 = buf.toBase64();
      const decoded = WebBuf.fromBase64(base64);
      expect(decoded.toHex()).toBe(hex);
    });

    it("should encode and decode arbitrary binary data of length n, n+1, n+2 ... m", () => {
      for (let i = 0; i < 100; i++) {
        const hex = new Array(i)
          .fill(0)
          .map((_, i) => i.toString(16).padStart(2, "0"))
          .join("");
        const buf = WebBuf.fromHex(hex);
        const base64 = buf.toBase64();
        const decoded = WebBuf.fromBase64(base64);
        expect(decoded.toHex()).toBe(hex);
      }
    });
  });

  describe("hex", () => {
    it("should encode and decode hex", () => {
      const myStr = "Hello, World!";
      const buf = WebBuf.fromUtf8(myStr);
      const hex = buf.toHex();
      const decoded = WebBuf.fromHex(hex);
      expect(decoded.toUtf8()).toBe(myStr);
    });
  });

  describe("base64", () => {
    it("should decode base64", () => {
      const base64 = "YW9ldQ==";
      const decoded = WebBuf.fromBase64(base64);
      expect(decoded.toUtf8()).toBe("aoeu");
    });

    it("should ignore whitespace", () => {
      const base64 = "\n   YW9ldQ==  ";
      const decoded = WebBuf.fromBase64(base64, true);
      expect(decoded.toUtf8()).toBe("aoeu");
    });

    it("should handle newline in utf8", () => {
      const base64 =
        "LS0tCnRpdGxlOiBUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3QKdGFnczoK";
      const decoded = WebBuf.fromBase64(base64);
      expect(decoded.toUtf8()).toBe(
        "---\ntitle: Three dashes marks the spot\ntags:\n",
      );
    });

    it("should strip newline in base64", () => {
      const base64 =
        "LS0tCnRpdGxlOiBUaHJlZSBkYXNoZXMgbWFya3MgdGhlIHNwb3QKdGFnczoKICAtIHlhbWwKICAtIGZyb250LW1hdHRlcgogIC0gZGFzaGVzCmV4cGFuZWQt";
      const decoded = WebBuf.fromBase64(base64);
      expect(decoded.toUtf8()).toBe(
        "---\ntitle: Three dashes marks the spot\ntags:\n  - yaml\n  - front-matter\n  - dashes\nexpaned-",
      );
    });

    it("invalid non-alaphanumeric characters should throws", () => {
      const base64 = "!\"#$%&'()*,.:;<=>?@[\\]^`{|}~";
      expect(() => WebBuf.fromBase64(base64)).toThrow();
    });
  });
});
