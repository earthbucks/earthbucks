import { describe, expect, test, beforeEach, it } from "vitest";
import { PowGpuNodeGpu } from "../src/pow-gpu-node-gpu.js";
import { WebBuf } from "webbuf";
import { FixedBuf } from "@earthbucks/lib";
import { Hash } from "@earthbucks/lib";

function blake3Hash(seed: WebBuf): FixedBuf<32> {
  return Hash.blake3Hash(seed);
}

function blake3HashAsync(seed: WebBuf): Promise<FixedBuf<32>> {
  return new Promise((resolve) => {
    resolve(Hash.blake3Hash(seed));
  });
}

describe("GpuPowNode", () => {
  describe("tensorFromBufferBitsAlt1", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = WebBuf.from([0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt1(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });
  });

  describe("tensorFromBufferBitsAlt2", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = WebBuf.from([0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt2(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });
  });

  describe("tensorFromBufferBitsAlt3", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = WebBuf.from([0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt3(buffer);
      expect(result.shape).toEqual([8]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    });

    it("should return a tensor with 16 values that are all int32 value 1 when passed a buffer of 0xffff", () => {
      const buffer = WebBuf.from([0xff, 0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt3(buffer);
      expect(result.shape).toEqual([16]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    });

    it("should return a tensor with binary data", () => {
      const buffer = WebBuf.from([0x80, 0x80]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt3(buffer);
      expect(result.shape).toEqual([16]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe("tensorFromBufferBitsAlt4", () => {
    it("should return a tensor with 8 values that are all int32 value 1 when passed a buffer of 0xff", () => {
      const buffer = WebBuf.from([0xff, 0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt4(buffer);
      expect(result.shape).toEqual([16]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    });

    it("should return a tensor with 16 values that are all int32 value 1 when passed a buffer of 0xffff", () => {
      const buffer = WebBuf.from([0xff, 0xff, 0xff, 0xff]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt4(buffer);
      expect(result.shape).toEqual([32]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
      ]);
    });

    it("should return a tensor with binary data", () => {
      const buffer = WebBuf.from([0x80, 0x80]);
      const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
      const previousBlockIds: FixedBuf<32>[] = [];
      const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
      const result = gpupow.tensorFromBufferBitsAlt4(buffer);
      expect(result.shape).toEqual([16]);
      expect(result.dtype).toBe("int32");
      const res = result.arraySync();
      expect(res).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
    });
  });

  test("algo17", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds: FixedBuf<32>[] = [];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toHex()).toBe(
      "d89f017c661dbf2e68922520f29a746aa269ed9f66377afcec6783b44a97213a",
    );
  });

  test("algo17 async", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds: FixedBuf<32>[] = [];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toHex()).toBe(
      "d89f017c661dbf2e68922520f29a746aa269ed9f66377afcec6783b44a97213a",
    );
  });

  test("algo257", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toHex()).toBe(
      "c7a7826d1f7155402c5d2efae25f82ea930df7ef1054a0fbe5f00b38c1784282",
    );
  });

  test("algo257 async", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toHex()).toBe(
      "c7a7826d1f7155402c5d2efae25f82ea930df7ef1054a0fbe5f00b38c1784282",
    );
  });

  test("algo1289", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toHex()).toBe(
      "726f2d4547af7271d1f85aea80448fb2d0b38de7083966565e112eac3ee2094a",
    );
  });

  test("algo1289 async", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toHex()).toBe(
      "726f2d4547af7271d1f85aea80448fb2d0b38de7083966565e112eac3ee2094a",
    );
  });

  test("algo1627", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toHex()).toBe(
      "60b36e32a89ec32f9d7a310e45b9ce044e25c4eae41c0f8a3aced26d0fa91d24",
    );
  });

  test("algo1627 async", async () => {
    const workingBlockId = blake3Hash(WebBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(WebBuf.from("previousBlockId"))];
    const gpupow = new PowGpuNodeGpu(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toHex()).toBe(
      "60b36e32a89ec32f9d7a310e45b9ce044e25c4eae41c0f8a3aced26d0fa91d24",
    );
  });
});
