import { describe, it, expect } from "vitest";
import { blake3Hash, doubleBlake3Hash, blake3Mac } from "../src/index.js";
import { WebBuf } from "@webbuf/webbuf";
import { FixedBuf } from "@webbuf/fixedbuf";

describe("Blake3", () => {
  it("should correctly compute blake3 hash", () => {
    const input = WebBuf.fromUtf8("test input");
    const result = blake3Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(32);
    const expectedHashHex =
      "aa4909e14f1389afc428e481ea20ffd9673604711f5afb60a747fec57e4c267c";
    expect(result.toHex()).toBe(expectedHashHex);
  });

  it("should correctly compute double blake3 hash", () => {
    const input = WebBuf.fromUtf8("test input");
    const result = doubleBlake3Hash(input);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(32);
    const expectedDoubleHashHex =
      "f89701be8691e987be5dfc6af49073c1d3faf76fdaa8ae71221f73d7cb2cea60";
    expect(result.toHex()).toBe(expectedDoubleHashHex);
  });

  it("should correctly compute blake3 MAC", () => {
    const key = blake3Hash(WebBuf.fromUtf8("key"));
    const message = WebBuf.fromUtf8("message");
    const result = blake3Mac(key, message);

    expect(result).toBeInstanceOf(FixedBuf);
    expect(result.buf.length).toBe(32);
    const expectedMacHex =
      "55603656ac7bd780db8fece23aad002ee008a605540fe3527a260c4b6e3b2b7e";
    expect(result.toHex()).toBe(expectedMacHex);
  });
});
