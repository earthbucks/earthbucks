import { describe, test, expect } from "vitest";
import { sha256, Pow2 } from "../src/pow2-wasm.js";
import { WebBuf, FixedBuf } from "@earthbucks/lib";

describe("Pow2 tests", async () => {
  test("sha256 library against crypto", async () => {
    const data = WebBuf.fromHex("1234");
    const result = await sha256(data);
    expect(result.toHex()).toBe(
      "3a103a4e5729ad68c02a678ae39accfbc0ae208096437401b7ceab63cca0622f",
    );

    const data2 = WebBuf.fromHex("00".repeat(217));
    const result2 = await sha256(data2);
    expect(result2.toHex()).toBe(
      "087fe55d46b5fac5e233bc72e9f0392365dac5ff09cee4278caca86691771625",
    );

    const data3 = WebBuf.fromHex("00".repeat(16384));
    const result3 = await sha256(data3);
    expect(result3.toHex()).toBe(
      "4fe7b59af6de3b665b67788cc2f99892ab827efae3a467342b3bb4e3bc8e5bfe",
    );

    const sha256hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(sha256hash);
    const hashHex = Array.from(hashArray, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    expect(result.toHex()).toBe(hashHex);
  });

  test("debug: get header hash", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow2 = new Pow2(headerAllZeroes);
    const result = await pow2.debugGetHeaderHash();
    expect(result.toHex()).toBe(
      "087fe55d46b5fac5e233bc72e9f0392365dac5ff09cee4278caca86691771625",
    );
  });

  test("debug: get final matrix data hash", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow2 = new Pow2(headerAllZeroes);
    const result = await pow2.debugGetFinalMatrixDataHash();
    expect(result.toHex()).toBe(
      "cbb698a22fde508702d83523bb9e0c1ead2d9e6089227d8c4368522eaa028f73",
    );
  });

  test("debug: get m1 first 32", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow2 = new Pow2(headerAllZeroes);
    const result = await pow2.debugGetM1First32();
    expect(result).toEqual(
      new Uint32Array([
        0, 0, 2, 0, 1, 3, 3, 3, 3, 2, 1, 1, 1, 1, 3, 1, 1, 0, 1, 2, 2, 3, 1, 1,
        3, 3, 2, 2, 3, 0, 1, 1,
      ]),
    );
  });

  test("debug: get m2 first 32", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow2 = new Pow2(headerAllZeroes);
    const result = await pow2.debugGetM2First32();
    expect(result).toEqual(
      new Uint32Array([
        1, 0, 0, 3, 1, 1, 1, 0, 3, 3, 0, 2, 1, 2, 1, 3, 2, 0, 1, 2, 0, 3, 0, 2,
        1, 1, 0, 3, 0, 0, 3, 0,
      ]),
    );
  });

  test("debug: get m3 first 32", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow2 = new Pow2(headerAllZeroes);
    const result = await pow2.debugGetM3First32();
    expect(result).toEqual(
      new Uint32Array([
        59, 82, 71, 85, 86, 79, 71, 96, 56, 86, 80, 90, 52, 66, 87, 47, 79, 94,
        70, 66, 82, 96, 68, 72, 73, 74, 83, 91, 71, 67, 81, 67,
      ]),
    );
  });

  test("debug: get m4 hash", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow2 = new Pow2(headerAllZeroes);
      const result = await pow2.debugGetM4Hash();
      expect(result.toHex()).toBe(
        "d9d9ae366c55fd20831561c5382265b7ce876845cd6dd3783fee5d943eceaef9",
      );
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("ff".repeat(217)),
      );
      const pow2 = new Pow2(headerAllOnes);
      const result = await pow2.debugGetM4Hash();
      expect(result.toHex()).toBe(
        "c827bc705272f97b099d99db5f62198fa2b33647ace109108d3e25bd051d024f",
      );
    }

    {
      const headerKnownValue = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex(
          "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767b00797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8",
        ),
      );
      const pow2 = new Pow2(headerKnownValue);
      const result = await pow2.debugGetM4Hash();
      expect(result.toHex()).toBe(
        "000cc5c8e6121bfe57bd855e8ca5c8a50b13d44c2de04171a3c9b8d81becb26f",
      );
    }
  });
});
