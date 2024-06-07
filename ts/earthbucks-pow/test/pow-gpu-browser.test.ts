import { describe, expect, test, beforeEach, it } from "vitest";
import { PowGpuBrowser } from "../src/pow-gpu-browser.js";
import { Buffer as SysBuf } from "buffer";
import { hash as blake3HashRaw } from "blake3";

function blake3Hash(seed: SysBuf): SysBuf {
  return SysBuf.from(blake3HashRaw(seed));
}

function blake3HashAsync(seed: SysBuf): Promise<SysBuf> {
  return new Promise((resolve) => {
    resolve(SysBuf.from(blake3HashRaw(seed)));
  });
}

describe("GpuPowBrowser", () => {
  describe("tensorFromBufferBitsAlt1", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = SysBuf.from([0xff]);
      const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
      const previousBlockIds: SysBuf[] = [];
      const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt1(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });
  });

  describe("tensorFromBufferBitsAlt2", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = SysBuf.from([0xff]);
      const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
      const previousBlockIds: SysBuf[] = [];
      const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt2(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });
  });

  describe("tensorFromBufferBits", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = SysBuf.from([0xff]);
      const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
      const previousBlockIds: SysBuf[] = [];
      const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt3(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });
  });
  test("algo17", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds: SysBuf[] = [];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "bf04bc09f8c1ae36d6309670532535fdc08e988a195de346e4964c3b80226e44",
    );
  });

  test("algo17 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds: SysBuf[] = [];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "bf04bc09f8c1ae36d6309670532535fdc08e988a195de346e4964c3b80226e44",
    );
  });

  test("algo257", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "efca7d84ffa0e3b09fe01d5669a92d8b5ed0a26453a4bb8037ebdab00b38860b",
    );
  });

  test("algo257 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "efca7d84ffa0e3b09fe01d5669a92d8b5ed0a26453a4bb8037ebdab00b38860b",
    );
  });

  test.skip("algo1289", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "e16afb6fe0510dfea8cfe176931c0ba8da66c2e6f95da3209ae840316f480280",
    );
  });

  test.skip("algo1289 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "e16afb6fe0510dfea8cfe176931c0ba8da66c2e6f95da3209ae840316f480280",
    );
  });

  test.skip("algo1627", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "492f608f757844a2407c960ff0623470af1b770a25496ba82d6bcc0a39e32442",
    );
  });

  test.skip("algo1627 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new PowGpuBrowser(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "492f608f757844a2407c960ff0623470af1b770a25496ba82d6bcc0a39e32442",
    );
  });
});
