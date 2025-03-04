import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.js";
import { Block } from "../src/block.js";
import { Tx } from "../src/tx.js";
import { BufWriter } from "@webbuf/rw";
import { BufReader } from "@webbuf/rw";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";
import { WORK_SER_ALGO_NUM } from "../src/work-ser-algo.js";
import { WORK_PAR_ALGO_NUM } from "../src/work-par-algo.js";

describe("Block", () => {
  test("toBufWriter", () => {
    const bh = new Header();
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    const bw = block.toBufWriter(new BufWriter());
    expect(bw.toBuf().length).toBeGreaterThan(0);
  });

  test("toBuf", () => {
    const bh = new Header();
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    const u8vec = block.toBuf();
    expect(u8vec.length).toBeGreaterThan(0);
  });

  test("fromBufReader", () => {
    const bh = new Header();
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    const bw = block.toBufWriter(new BufWriter());
    const buf = bw.toBuf();
    const br = new BufReader(buf);
    const block2 = Block.fromBufReader(br);
    expect(block2.header.version.n).toBe(bh.version.n);
    expect(block2.header.prevBlockId.buf.toString("hex")).toEqual(
      bh.prevBlockId.buf.toString("hex"),
    );
    expect(block2.header.rootMerkleTreeId).toEqual(bh.rootMerkleTreeId);
    expect(block2.header.timestamp.bn).toBe(bh.timestamp.bn);
    expect(block2.header.target).toEqual(bh.target);
    expect(block2.header.nonce).toEqual(bh.nonce);
    expect(block2.header.blockNum.bn).toBe(bh.blockNum.bn);
  });

  test.skip("isGenesis", () => {
    const bh = new Header({
      workSerAlgo: new U16BE(WORK_SER_ALGO_NUM.blake3_3),
      workParAlgo: new U16BE(WORK_PAR_ALGO_NUM.algo1627),
    });
    const tx = new Tx(new U8(0), [], [], new U32BE(0n));
    const block = new Block(bh, [tx]);
    expect(block.isGenesis()).toBe(true);
  });
});
