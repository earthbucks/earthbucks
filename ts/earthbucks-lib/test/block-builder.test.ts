import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.js";
import { Block } from "../src/block.js";
import { Tx } from "../src/tx.js";
import { BlockBuilder } from "../src/block-builder.js";
import { Script } from "../src/script.js";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";

describe("BlockBuilder", () => {
  test("fromBlock", () => {
    const bh = new Header();
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    const bb = BlockBuilder.fromBlock(block);
    expect(bb.header.version).toBe(bh.version);
    expect(bb.header.prevBlockId).toEqual(bh.prevBlockId);
    expect(bb.header.rootMerkleTreeId).toEqual(bh.rootMerkleTreeId);
    expect(bb.header.timestamp).toBe(bh.timestamp);
    expect(bb.header.target).toEqual(bh.target);
  });

  test("fromGenesis", () => {
    const target = new U256BE(0);
    const outputScript = new Script();
    const outputAmount = new U64BE(0n);
    const bb = BlockBuilder.fromGenesis(target, outputScript, outputAmount);
    expect(bb.header.version.n).toEqual(0);
    expect(bb.header.prevBlockId).toEqual(FixedBuf.alloc(32));
    expect(bb.header.rootMerkleTreeId.toHex()).toEqual(
      bb.rootMerkleTree.hash?.toHex(),
    );
    expect(bb.header.timestamp.n).toBeLessThanOrEqual(new Date().getTime());
    expect(bb.header.target).toEqual(target);
  });

  test("toBlock", () => {
    const bh = new Header();
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    const bb = BlockBuilder.fromBlock(block);
    const block2 = bb.toBlock();
    expect(block2.header.version.n).toBe(bh.version.n);
    expect(block2.header.prevBlockId.buf.toString("hex")).toEqual(
      bh.prevBlockId.buf.toString("hex"),
    );
    expect(block2.header.rootMerkleTreeId).toEqual(bh.rootMerkleTreeId);
    expect(bb.header.timestamp.bn).toEqual(0n);
    expect(block2.header.target).toEqual(bh.target);
  });
});
