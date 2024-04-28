import { describe, expect, test, beforeEach, it } from "@jest/globals";
import Header from "../src/header";
import Block from "../src/block";
import Tx from "../src/tx";
import BufferWriter from "../src/buffer-writer";
import BufferReader from "../src/buffer-reader";
import { Buffer } from "buffer";

describe("Block", () => {
  test("toBufferWriter", () => {
    const bh = new Header(
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
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const bw = block.toBufferWriter(new BufferWriter());
    expect(bw.toBuffer().length).toBeGreaterThan(0);
  });

  test("toBuffer", () => {
    const bh = new Header(
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
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const u8vec = block.toBuffer();
    expect(u8vec.length).toBeGreaterThan(0);
  });

  test("fromBufferReader", () => {
    const bh = new Header(
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
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    const bw = block.toBufferWriter(new BufferWriter());
    const br = new BufferReader(bw.toBuffer());
    const block2 = Block.fromBufferReader(br);
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
      0n,
      Buffer.alloc(32),
      Buffer.alloc(32),
    );
    const tx = new Tx(1, [], [], 0n);
    const block = new Block(bh, [tx]);
    expect(block.isGenesis()).toBe(true);
  });
});
