import { describe, expect, test, beforeEach, it } from "vitest";
import { GpuPowNode } from "../src/pow-gpu-node";
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

describe("GpuPow", () => {
  test("algo17", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds: SysBuf[] = [];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "2b6755925a1f56a1e5bcc96ff68ee57fa4a44ec354c43861877cd46380133994",
    );
  });

  test("algo17 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds: SysBuf[] = [];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo17();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "2b6755925a1f56a1e5bcc96ff68ee57fa4a44ec354c43861877cd46380133994",
    );
  });

  test("algo257", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "3099d3091310e878231efe2ce31db4dc78fb91203987b5416e31ab90c01bb812",
    );
  });

  test("algo257 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo257();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "3099d3091310e878231efe2ce31db4dc78fb91203987b5416e31ab90c01bb812",
    );
  });

  test("algo1289", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "56a298c46c3288bd16fddc207c6d98bb9c95f261341327d6c2a26686e68c3012",
    );
  });

  test("algo1289 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1289();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "56a298c46c3288bd16fddc207c6d98bb9c95f261341327d6c2a26686e68c3012",
    );
  });

  test("algo1627", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = gpupow.reducedBufsHash(result, blake3Hash);
    expect(res.toString("hex")).toBe(
      "73ab9279437bc7e7fdc2f96f0a93cb1ccba82634c76adadea74cfd2406bb2a89",
    );
  });

  test("algo1627 async", async () => {
    const workingBlockId = blake3Hash(SysBuf.from("workingBlockId"));
    const previousBlockIds = [blake3Hash(SysBuf.from("previousBlockId"))];
    const gpupow = new GpuPowNode(workingBlockId, previousBlockIds);
    const result = await gpupow.algo1627();
    const res = await gpupow.reducedBufsHashAsync(result, blake3HashAsync);
    expect(res.toString("hex")).toBe(
      "73ab9279437bc7e7fdc2f96f0a93cb1ccba82634c76adadea74cfd2406bb2a89",
    );
  });
});
