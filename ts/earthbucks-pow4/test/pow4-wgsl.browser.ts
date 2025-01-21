import { describe, test, expect } from "vitest";
import { Pow4 } from "../src/pow4-wgsl.js";
import { WebBuf, FixedBuf, Hash } from "@earthbucks/lib";

describe("Pow4 tests", async () => {
  test("placeholder test", async () => {});

  test("debug: get header hash", async () => {
    const headerAllZeroes = FixedBuf.fromBuf(
      217,
      WebBuf.fromHex("00".repeat(217)),
    );
    const pow4 = new Pow4(headerAllZeroes);
    await pow4.init();
    const result = await pow4.debugGetHeaderHash();
    expect(result.hash.toHex()).toBe(
      "087fe55d46b5fac5e233bc72e9f0392365dac5ff09cee4278caca86691771625",
    );
    expect(result.nonce).toBe(0);

    // now, generate the same hash with we crypto
    const sha256 = crypto.subtle.digest("SHA-256", headerAllZeroes.buf);
    const hashArray = new Uint8Array(await sha256);
    const hashHex = Array.from(hashArray, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    expect(result.hash.toHex()).toBe(hashHex);
  });

  test("debug: elementary iteration", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow4 = new Pow4(headerAllZeroes);
      await pow4.init();
      const result = await pow4.debugElementaryIteration();
      expect(result.hash.toHex()).toBe(
        "093265b1e3a766f100b93ac525e6dff0d51dfee6991c208410849503edb51854",
      );
      expect(result.nonce).toBe(0);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow4 = new Pow4(headerAllOnes);
      await pow4.init();
      const result = await pow4.debugElementaryIteration();
      expect(result.hash.toHex()).toBe(
        "97fb760dec4b37f939d934ea9c1132a1b9388ea57c324a566ba07c37823fdb8a",
      );
      expect(result.nonce).toBe(0);
    }
  });

  test("work", async () => {
    {
      const headerAllZeroes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("00".repeat(217)),
      );
      const pow4 = new Pow4(headerAllZeroes);
      await pow4.init();
      const result = await pow4.work();
      expect(result.hash.toHex()).toBe(
        "000002d934720700ba2157d7eac81e2c9b42400a293504267451f8e8b543f892",
      );
      expect(result.nonce).toBe(4513621);
    }

    {
      const headerAllOnes = FixedBuf.fromBuf(
        217,
        WebBuf.fromHex("11".repeat(217)),
      );
      const pow4 = new Pow4(headerAllOnes);
      await pow4.init();
      const result = await pow4.work();
      expect(result.hash.toHex()).toBe(
        "0000004edc8a8ad8f487aca139064836a5aad45301572812e5680df196f2ed0c",
      );
      expect(result.nonce).toBe(7111890);
    }
  });
});
