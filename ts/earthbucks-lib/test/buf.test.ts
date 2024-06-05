import { describe, test, expect } from "vitest";
import { SysBuf, EbxBuf, FixedBuf } from "../src/buf.js";

describe("EbxBuf", () => {
  test("to/from buf", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const isoBuf = EbxBuf.fromBuf(buf.length, buf);
    expect(isoBuf instanceof EbxBuf).toEqual(true);
    expect(isoBuf instanceof SysBuf).toEqual(true);
    expect(isoBuf instanceof FixedBuf).toEqual(false);
    expect(isoBuf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const isoBuf = EbxBuf.fromBuf(buf.length, buf);
    expect(isoBuf instanceof EbxBuf).toEqual(true);
    expect(isoBuf instanceof SysBuf).toEqual(true);
    expect(isoBuf instanceof FixedBuf).toEqual(false);
    const base58 = isoBuf.toBase58();
    const isoBuf2 = EbxBuf.fromBase58(buf.length, base58);
    expect(isoBuf2.toString("hex")).toEqual("deadbeef");
  });
});

describe("FixedEbxBuf", () => {
  test("to/from buf", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const fixedEbxBuf = FixedBuf.fromBuf(4, buf);
    expect(fixedEbxBuf instanceof EbxBuf).toEqual(true);
    expect(fixedEbxBuf instanceof SysBuf).toEqual(true);
    expect(fixedEbxBuf instanceof FixedBuf).toEqual(true);
    expect(fixedEbxBuf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const fixedEbxBuf = FixedBuf.fromBuf(4, buf);
    expect(fixedEbxBuf instanceof EbxBuf).toEqual(true);
    expect(fixedEbxBuf instanceof SysBuf).toEqual(true);
    expect(fixedEbxBuf instanceof FixedBuf).toEqual(true);
    const base58 = fixedEbxBuf.toBase58();
    const fixedEbxBuf2 = FixedBuf.fromBase58(4, base58);
    expect(fixedEbxBuf2.toString("hex")).toEqual("deadbeef");
  });
});
