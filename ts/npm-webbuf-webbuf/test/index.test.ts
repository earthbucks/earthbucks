import { describe, it, expect } from "vitest";
import { WebBuf } from "../src/index.js";

describe("Index", () => {
  it("should encode and decode base64", () => {
    const myStr = "Hello, World!";
    const buf = WebBuf.fromUtf8(myStr);
    const base64 = buf.toString("base64");
    const decoded = WebBuf.from(base64, "base64");
    expect(decoded.toUtf8()).toBe(myStr);
  });

  it("should encode and decode hex", () => {
    const myStr = "Hello, World!";
    const buf = WebBuf.fromUtf8(myStr);
    const hex = buf.toString("hex");
    const decoded = WebBuf.from(hex, "hex");
    expect(decoded.toUtf8()).toBe(myStr);
  });
});
