import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.js";
import { Block } from "../src/block.js";
import { Tx } from "../src/tx.js";
import { IsoBufWriter } from "../src/iso-buf-writer.js";
import { IsoBufReader } from "../src/iso-buf-reader.js";
import { SysBuf, FixedIsoBuf } from "../src/iso-buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("Block", () => {
  test("toIsoBufWriter", () => {
    const bh = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const tx = new Tx(new U8(1), [], [], new U64(0n));
    const block = new Block(bh, [tx]);
    const bw = block.toIsoBufWriter(new IsoBufWriter());
    expect(bw.toIsoBuf().length).toBeGreaterThan(0);
  });

  test("toIsoBuf", () => {
    const bh = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const tx = new Tx(new U8(1), [], [], new U64(0n));
    const block = new Block(bh, [tx]);
    const u8vec = block.toIsoBuf();
    expect(u8vec.length).toBeGreaterThan(0);
  });

  test("fromIsoBufReader", () => {
    const bh = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const tx = new Tx(new U8(1), [], [], new U64(0n));
    const block = new Block(bh, [tx]);
    const bw = block.toIsoBufWriter(new IsoBufWriter());
    const buf = bw.toIsoBuf();
    const br = new IsoBufReader(buf);
    const block2 = Block.fromIsoBufReader(br).unwrap();
    expect(block2.header.version.n).toBe(bh.version.n);
    expect(block2.header.prevBlockId.toString("hex")).toEqual(
      bh.prevBlockId.toString("hex"),
    );
    expect(block2.header.merkleRoot).toEqual(bh.merkleRoot);
    expect(block2.header.timestamp.bn).toBe(bh.timestamp.bn);
    expect(block2.header.target).toEqual(bh.target);
    expect(block2.header.nonce).toEqual(bh.nonce);
    expect(block2.header.blockNum.bn).toBe(bh.blockNum.bn);
  });

  test("isGenesis", () => {
    const bh = new Header(
      new U32(1),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U64(0n),
      new U64(0n),
      FixedIsoBuf.alloc(32),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
      new U32(0),
      FixedIsoBuf.alloc(32),
    );
    const tx = new Tx(new U8(1), [], [], new U64(0n));
    const block = new Block(bh, [tx]);
    expect(block.isGenesis()).toBe(true);
  });
});
