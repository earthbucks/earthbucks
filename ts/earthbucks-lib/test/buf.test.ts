import { describe, test, expect } from "vitest";
import { WebBuf, EbxBuf, FixedBuf } from "../src/buf.js";

describe("EbxBuf", () => {
  test("to/from buf", () => {
    const buf = WebBuf.from("deadbeef", "hex");
    const isoBuf = EbxBuf.fromBuf(buf.length, buf);
    expect(isoBuf instanceof EbxBuf).toEqual(true);
    expect(isoBuf instanceof WebBuf).toEqual(false);
    expect(isoBuf instanceof FixedBuf).toEqual(false);
    expect(isoBuf.buf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = WebBuf.from("deadbeef", "hex");
    const isoBuf = EbxBuf.fromBuf(buf.length, buf);
    expect(isoBuf instanceof EbxBuf).toEqual(true);
    expect(isoBuf instanceof WebBuf).toEqual(false);
    expect(isoBuf instanceof FixedBuf).toEqual(false);
    const base58 = isoBuf.toBase58();
    const isoBuf2 = EbxBuf.fromBase58(buf.length, base58);
    expect(isoBuf2.buf.toString("hex")).toEqual("deadbeef");
  });
});

describe("FixedEbxBuf", () => {
  test("to/from buf", () => {
    const buf = WebBuf.from("deadbeef", "hex");
    const fixedEbxBuf = FixedBuf.fromBuf(4, buf);
    expect(fixedEbxBuf instanceof EbxBuf).toEqual(true);
    expect(fixedEbxBuf instanceof WebBuf).toEqual(false);
    expect(fixedEbxBuf instanceof FixedBuf).toEqual(true);
    expect(fixedEbxBuf.buf.toString("hex")).toEqual("deadbeef");
  });

  test("to/from base58", () => {
    const buf = WebBuf.from("deadbeef", "hex");
    const fixedEbxBuf = FixedBuf.fromBuf(4, buf);
    expect(fixedEbxBuf instanceof EbxBuf).toEqual(true);
    expect(fixedEbxBuf instanceof WebBuf).toEqual(false);
    expect(fixedEbxBuf instanceof FixedBuf).toEqual(true);
    const base58 = fixedEbxBuf.toBase58();
    const fixedEbxBuf2 = FixedBuf.fromBase58(4, base58);
    expect(fixedEbxBuf2.buf.toString("hex")).toEqual("deadbeef");
  });
});
