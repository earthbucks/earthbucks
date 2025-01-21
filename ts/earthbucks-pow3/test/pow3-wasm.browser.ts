import { describe, test, expect } from "vitest";
import { Pow3 } from "../src/pow3-wasm.js";
import { Hash, WebBuf, FixedBuf } from "@earthbucks/lib";

describe("Pow3 tests", async () => {
  test("iterate", async () => {
    const headerWebBuf = WebBuf.fromHex("00".repeat(217));
    const headerFixedBuf = FixedBuf.fromBuf(217, headerWebBuf);
    const pow3 = new Pow3(headerFixedBuf);
    await pow3.init();
    const result = await pow3.iterate();
    expect(result.hash.toHex()).toBe(
      "6b9a2ba400b5e2918c3e348186636fc49f07830e341f8eaa37744b580197e670",
    );
    expect(result.nonce).toBe(0);
    expect(result.check).toBe(false);
  });

  test("iterate twice", async () => {
    const headerWebBuf = WebBuf.fromHex("00".repeat(217));
    const headerFixedBuf = FixedBuf.fromBuf(217, headerWebBuf);
    const pow3 = new Pow3(headerFixedBuf);
    await pow3.init();

    // first
    {
      const result = await pow3.iterate();
      expect(result.hash.toHex()).toBe(
        "6b9a2ba400b5e2918c3e348186636fc49f07830e341f8eaa37744b580197e670",
      );
      expect(result.nonce).toBe(0);
      expect(result.check).toBe(false);
    }

    // second
    {
      const result = await pow3.iterate();
      expect(result.hash.toHex()).toBe(
        "058931dbff35a5de32c4fdf0a5f4a288d2894c182132ccca683956c2046777c8",
      );
      expect(result.nonce).toBe(0);
      expect(result.check).toBe(false);
    }
  });

  test("iterate until check", async () => {
    const headerWebBuf = WebBuf.fromHex("00".repeat(217));
    const headerFixedBuf = FixedBuf.fromBuf(217, headerWebBuf);
    const pow3 = new Pow3(headerFixedBuf);
    await pow3.init();

    let result = await pow3.iterate();
    while (!result.check) {
      result = await pow3.iterate();
    }

    expect(result.hash.toHex()).toBe(
      "000195a6bdaff7d8b09bec60931a46f0bb60d5cc4be72dee9e051b0edc05fb7a",
    );
    expect(result.nonce).toBe(653);
    expect(result.check).toBe(true);
  });
});
