import { describe, expect, test, beforeEach, it } from "vitest";
import Header from "../src/header";
import { Buffer } from "buffer";

describe("BlockHeader", () => {
  test("toIsoBuf and fromIsoBuf", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    const buf = bh1.toIsoBuf();
    const bh2 = Header.fromIsoBuf(buf).unwrap();
    expect(bh1.version).toBe(bh2.version);
    expect(bh1.prevBlockId).toEqual(bh2.prevBlockId);
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot);
    expect(bh1.timestamp).toBe(bh2.timestamp);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum).toBe(bh2.blockNum);
  });

  test("toIsoBuf", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    const buf = bh1.toIsoBuf();
    const bh2 = Header.fromIsoBuf(buf).unwrap();
    expect(bh1.version).toBe(bh2.version);
    expect(bh1.prevBlockId).toEqual(bh2.prevBlockId);
    expect(bh1.merkleRoot).toEqual(bh2.merkleRoot);
    expect(bh1.timestamp).toBe(bh2.timestamp);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum).toBe(bh2.blockNum);
  });

  test("isValid", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    expect(bh1.isValid()).toBe(true);
  });

  test("isGenesis", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    expect(bh1.isGenesis()).toBe(true);
  });

  test("hash", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    expect(Buffer.from(bh1.hash()).toString("hex")).toBe(
      "207308090b4e6af2f1b46b22b849506534536fb39ca5976548f1032e2360ff00",
    );
  });

  test("id", () => {
    const bh1 = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    expect(Buffer.from(bh1.id()).toString("hex")).toBe(
      "24f3f2f083a1accdbc64581b928fbde7f623756c45a17f5730ff7019b424360e",
    );
  });

  describe("fromPrevBlockHeader", () => {
    test("fromPrevBlockHeader", () => {
      const prevBlockHeader = new Header(
        1,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
      );
      const prevAdjustmentBlockHeader = null;
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      ).unwrap();
      expect(bh.version).toBe(1);
      expect(bh.prevBlockId).toEqual(prevBlockHeader.id());
      expect(bh.merkleRoot).toEqual(Buffer.alloc(32));
      expect(bh.timestamp).toBeLessThanOrEqual(new Date().getTime() / 1000);
      expect(bh.target).toEqual(Buffer.alloc(32));
    });

    test("should correctly adjust the target if index is a multiple of BLOCKS_PER_ADJUSTMENT", () => {
      const prevBlockHeader = new Header(
        1,
        Buffer.alloc(32),
        Buffer.alloc(32),
        Header.BLOCKS_PER_ADJUSTMENT - 1n,
        Header.BLOCKS_PER_ADJUSTMENT - 1n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
      );
      const prevAdjustmentBlockHeader = new Header(
        1,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
      );
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      ).unwrap();
      expect(bh.blockNum).toBe(Header.BLOCKS_PER_ADJUSTMENT);
      expect(bh.target).toEqual(Header.adjustTarget(Buffer.alloc(32), 0n));
    });

    test("should correctly adjust the target for non-trivial adjustment", () => {
      const initialTarget = Buffer.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = (2016n * 600n) / 2n; // One week
      const prevBlockHeader = new Header(
        1,
        Buffer.alloc(32),
        Buffer.alloc(32),
        timeDiff - 1n,
        Header.BLOCKS_PER_ADJUSTMENT - 1n,
        initialTarget,
        Buffer.alloc(32),
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
      );
      const prevAdjustmentBlockHeader = new Header(
        1,
        Buffer.alloc(32),
        Buffer.alloc(32),
        0n,
        0n,
        initialTarget,
        Buffer.alloc(32),
        0n,
        Buffer.alloc(32),
        Buffer.alloc(32),
      );
      const bh = Header.fromPrevBlockHeader(
        prevBlockHeader,
        prevAdjustmentBlockHeader,
      ).unwrap();
      expect(bh.blockNum).toBe(Header.BLOCKS_PER_ADJUSTMENT);
      expect(Buffer.from(bh.target).toString("hex")).toEqual(
        "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });
  });

  describe("adjustTarget", () => {
    test("adjustTarget", () => {
      const prevTarget = Buffer.alloc(32);
      const timeDiff = 0n;
      expect(Header.adjustTarget(prevTarget, timeDiff)).toEqual(
        Buffer.alloc(32),
      );
    });

    it("should correctly adjust the target if timeDiff is less than one week", () => {
      const targetBuf = Buffer.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = 2016n * 200n; // Less than a week
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(Buffer.from(newTarget).toString("hex")).toBe(
        "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });

    it("should correctly adjust the target if timeDiff is more than eight weeks", () => {
      const targetBuf = Buffer.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = 2016n * 600n * 3n; // More than four weeks
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(Buffer.from(newTarget).toString("hex")).toBe(
        "00000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffe",
      );
    });

    it("should correctly adjust the target if timeDiff is between one and eight weeks", () => {
      const targetBuf = Buffer.from(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "hex",
      );
      const timeDiff = 2016n * 600n; // Two weeks
      const newTarget = Header.adjustTarget(targetBuf, timeDiff);
      expect(Buffer.from(newTarget).toString("hex")).toBe(
        "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );
    });
  });
});
