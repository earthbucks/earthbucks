import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.ts";
import { Block } from "../src/block.ts";
import { Tx } from "../src/tx.ts";
import { IsoBufWriter } from "../src/iso-buf-writer.ts";
import { IsoBufReader } from "../src/iso-buf-reader.ts";
import { Buffer } from "buffer";

describe("Block", () => {
  test("toIsoBufWriter", () => {
    const bh = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
    );
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const bw = block.toIsoBufWriter(new IsoBufWriter());
    expect(bw.toIsoBuf().length).toBeGreaterThan(0);
  });

  test("toIsoBuf", () => {
    const bh = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
    );
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const u8vec = block.toIsoBuf();
    expect(u8vec.length).toBeGreaterThan(0);
  });

  test("fromIsoBufReader", () => {
    const bh = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
    );
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const bw = block.toIsoBufWriter(new IsoBufWriter());
    const buf = bw.toIsoBuf();
    const br = new IsoBufReader(buf);
    const block2 = Block.fromIsoBufReader(br).unwrap();
    expect(block2.header.version).toBe(bh.version);
    expect(block2.header.prevBlockId).toEqual(bh.prevBlockId);
    expect(block2.header.merkleRoot).toEqual(bh.merkleRoot);
    expect(block2.header.timestamp).toBe(bh.timestamp);
    expect(block2.header.target).toEqual(bh.target);
    expect(block2.header.nonce).toEqual(bh.nonce);
    expect(block2.header.blockNum).toBe(bh.blockNum);
  });

  test("isGenesis", () => {
    const bh = new Header(
      1,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0n,
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
      0,
      Buffer.alloc(32),
    );
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    expect(block.isGenesis()).toBe(true);
  });
});
