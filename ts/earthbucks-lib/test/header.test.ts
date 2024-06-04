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

  describe("fromPrevBlockHeader", () => {
    test("fromPrevBlockHeader", () => {
      const prevBlockHeader = new Header(
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
      const prevAdjustmentBlockHeader = null;
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      );
      expect(bh.version.n).toBe(0);
      expect(bh.prevBlockId).toEqual(prevBlockHeader.id());
      expect(bh.merkleRoot).toEqual(FixedBuf.alloc(32));
      expect(bh.timestamp.n).toBeLessThanOrEqual(new Date().getTime() / 1000);
      expect(bh.target).toEqual(FixedBuf.alloc(32));
    });

    test("should correctly adjust the target if index is a multiple of BLOCKS_PER_ADJUSTMENT", () => {
      const prevBlockHeader = new Header(
        new U8(0),
        FixedBuf.alloc(32),
        FixedBuf.alloc(32),
        new U64((Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn - 1n) * 600n),
        new U32(Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn - 1n),
        FixedBuf.alloc(32),
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
      );
      const prevAdjustmentBlockHeader = new Header(
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
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      );
      expect(bh.blockNum.bn).toEqual(Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn);
      expect(bh.target).toEqual(
        Header.adjustTarget(FixedBuf.alloc(32), new U64(0n)),
      );
    });

    test("should correctly adjust the target for non-trivial adjustment", () => {
      const initialTarget = FixedBuf.fromStrictHex(
        32,
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
      const timeDiff = (2016n * 600n) / 2n; // One week
      const prevBlockHeader = new Header(
        new U8(0),
        FixedBuf.alloc(32),
        FixedBuf.alloc(32),
        new U64(timeDiff - 1n),
        new U32(Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn - 1n),
        initialTarget,
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
      );
      const prevAdjustmentBlockHeader = new Header(
        new U8(0),
        FixedBuf.alloc(32),
        FixedBuf.alloc(32),
        new U64(0n),
        new U32(0n),
        initialTarget,
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
        new U16(0),
        FixedBuf.alloc(32),
      );
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      );
      expect(bh.blockNum.bn).toEqual(Header.BLOCKS_PER_TARGET_ADJ_PERIOD.bn);
      expect(SysBuf.from(bh.target).toString("hex")).toEqual(
        "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });
  });

  describe("adjustTarget", () => {
    test("adjustTarget", () => {
      const prevTarget = FixedBuf.alloc(32);
      const timeDiff = new U64(0n);
      expect(Header.adjustTarget(prevTarget, timeDiff)).toEqual(
        FixedBuf.alloc(32),
      );
    });

    it("should correctly adjust the target if timeDiff is less than one week", () => {
      const targetBuf = SysBuf.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = new U64(2016n * 200n); // Less than a week
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(SysBuf.from(newTarget).toString("hex")).toBe(
        "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });

    it("should correctly adjust the target if timeDiff is more than eight weeks", () => {
      const targetBuf = SysBuf.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = new U64(2016n * 600n * 3n); // More than four weeks
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(SysBuf.from(newTarget).toString("hex")).toBe(
        "00000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffe",
      );
    });

    it("should correctly adjust the target if timeDiff is between one and eight weeks", () => {
      const targetBuf = SysBuf.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = new U64(2016n * 600n); // Two weeks
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(SysBuf.from(newTarget).toString("hex")).toBe(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });
  });
});
