import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.js";
import { SysBuf, FixedBuf } from "../src/ebx-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("Header", () => {
  test("toBuf and fromBuf", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    const buf = bh1.toBuf();
    const bh2 = Header.fromBuf(buf);
    expect(bh1.version.bn).toEqual(bh2.version.bn);
    expect(bh1.prevBlockId.toString("hex")).toEqual(
      bh2.prevBlockId.toString("hex"),
    );
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot);
    expect(bh1.timestamp.bn).toEqual(bh2.timestamp.bn);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum.bn).toEqual(bh2.blockNum.bn);
  });

  test("toBuf", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    const buf = bh1.toBuf();
    const bh2 = Header.fromBuf(buf);
    expect(bh1.version.bn).toEqual(bh2.version.bn);
    expect(bh1.prevBlockId.toString("hex")).toEqual(
      bh2.prevBlockId.toString("hex"),
    );
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot);
    expect(bh1.timestamp.bn).toEqual(bh2.timestamp.bn);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum.bn).toEqual(bh2.blockNum.bn);
  });

  test("isValid", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    expect(bh1.isValid()).toBe(true);
  });

  test("isGenesis", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    expect(bh1.isGenesis()).toBe(true);
  });

  test("hash", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    expect(bh1.hash().toStrictHex()).toBe(
      "c62d5bb11ed250524c2a602a51c865b2a9fc9e3e7fa25958bd9ebf4b080d08eb",
    );
  });

  test("id", () => {
    const bh1 = new Header(
      new U8(0),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U64(0n),
      new U32(0n),
      FixedBuf.alloc(32),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
      new U16(0),
      FixedBuf.alloc(32),
    );
    expect(bh1.id().toStrictHex()).toBe(
      "dd4a2cc754029811082c3bf7316c1ef46e198bd2312020f9c61577d693348434",
    );
  });
});
