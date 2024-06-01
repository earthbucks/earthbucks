import { describe, test, expect } from "vitest";
import { SysBuf, IsoBuf, FixedIsoBuf } from "../src/iso-buf.js";

describe("IsoBuf", () => {
  test("to/from buf", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const isoBuf = IsoBuf.fromBuf(buf.length, buf).unwrap();
    expect(isoBuf instanceof IsoBuf).toEqual(true);
    expect(isoBuf instanceof SysBuf).toEqual(true);
    expect(isoBuf instanceof FixedIsoBuf).toEqual(false);
    expect(isoBuf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const isoBuf = IsoBuf.fromBuf(buf.length, buf).unwrap();
    expect(isoBuf instanceof IsoBuf).toEqual(true);
    expect(isoBuf instanceof SysBuf).toEqual(true);
    expect(isoBuf instanceof FixedIsoBuf).toEqual(false);
    const base58 = isoBuf.toBase58();
    const isoBuf2 = IsoBuf.fromBase58(buf.length, base58).unwrap();
    expect(isoBuf2.toString("hex")).toEqual("deadbeef");
  });
});

describe("FixedIsoBuf", () => {
  test("to/from buf", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const fixedIsoBuf = FixedIsoBuf.fromBuf(4, buf).unwrap();
    expect(fixedIsoBuf instanceof IsoBuf).toEqual(true);
    expect(fixedIsoBuf instanceof SysBuf).toEqual(true);
    expect(fixedIsoBuf instanceof FixedIsoBuf).toEqual(true);
    expect(fixedIsoBuf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = Buffer.from("deadbeef", "hex");
    const fixedIsoBuf = FixedIsoBuf.fromBuf(4, buf).unwrap();
    expect(fixedIsoBuf instanceof IsoBuf).toEqual(true);
    expect(fixedIsoBuf instanceof SysBuf).toEqual(true);
    expect(fixedIsoBuf instanceof FixedIsoBuf).toEqual(true);
    const base58 = fixedIsoBuf.toBase58();
    const fixedIsoBuf2 = FixedIsoBuf.fromBase58(4, base58).unwrap();
    expect(fixedIsoBuf2.toString("hex")).toEqual("deadbeef");
  });
});
