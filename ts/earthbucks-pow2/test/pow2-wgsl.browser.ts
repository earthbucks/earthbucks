import { describe, test, expect } from "vitest";
import { Pow2 } from "../src/pow2-wgsl.js";
import { WebBuf, FixedBuf } from "@earthbucks/lib";

describe("Pow2 tests", async () => {
  test("placeholder test", async () => {});

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
      expect(result.toHex()).toBe("c827bc705272f97b099d99db5f62198fa2b33647ace109108d3e25bd051d024f");
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

  test("debug: iterate once with check", async () => {
    {
      const headerKnownValue = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex(
          "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767b00797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8",
        ),
      );
      const pow2 = new Pow2(headerKnownValue);
      const result = await pow2.debugIterateOnceWithCheck();
      const { hash, check, nonce } = result;
      expect(hash.toHex()).toBe(
        "000cc5c8e6121bfe57bd855e8ca5c8a50b13d44c2de04171a3c9b8d81becb26f",
      );
      expect(check).toBe(true);
      expect(nonce).toBe(1970699008);
    }

    {
      const headerKnownValue = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex(
          "00".repeat(217),
        ),
      );
      const pow2 = new Pow2(headerKnownValue);
      const result = await pow2.debugIterateOnceWithCheck();
      const { hash, check, nonce } = result;
      expect(check).toBe(false);
    }
  });
});
