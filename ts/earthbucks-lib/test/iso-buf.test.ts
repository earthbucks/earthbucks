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
});
