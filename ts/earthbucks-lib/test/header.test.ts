import { describe, expect, test, beforeEach, it } from "vitest";
import { Header } from "../src/header.js";
import { FixedBuf } from "@webbuf/fixedbuf";
import { U8, U16BE, U32BE, U64BE, U128BE, U256BE } from "@webbuf/numbers";
import { BufReader } from "@webbuf/rw";
import { BufWriter } from "@webbuf/rw";
import { WORK_SER_ALGO_NUM } from "../src/work-ser-algo.js";
import { WORK_PAR_ALGO_NUM } from "../src/work-par-algo.js";

describe("Header", () => {
  test("toBuf and fromBuf constructor", () => {
    const bh1 = new Header({
      version: new U8(1),
    });
    expect(bh1.version.n).toBe(1);
    expect(bh1.prevBlockId.buf.toString("hex")).toBe(
      FixedBuf.alloc(32).toHex(),
    );
  });

  test("toBuf and fromBuf", () => {
    const bh1 = new Header();
    const buf = bh1.toBuf();
    const bh2 = Header.fromBuf(buf);
    expect(bh1.version.bn).toEqual(bh2.version.bn);
    expect(bh1.prevBlockId.buf.toString("hex")).toEqual(
      bh2.prevBlockId.buf.toString("hex"),
    );
    expect(bh1.rootMerkleTreeId).toEqual(bh2.rootMerkleTreeId);
    expect(bh1.timestamp.bn).toEqual(bh2.timestamp.bn);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum.bn).toEqual(bh2.blockNum.bn);
  });

  test("toBuf", () => {
    const bh1 = new Header();
    const buf = bh1.toBuf();
    const bh2 = Header.fromBuf(buf);
    expect(bh1.version.bn).toEqual(bh2.version.bn);
    expect(bh1.prevBlockId.buf.toString("hex")).toEqual(
      bh2.prevBlockId.buf.toString("hex"),
    );
    expect(bh1.rootMerkleTreeId).toEqual(bh2.rootMerkleTreeId);
    expect(bh1.timestamp.bn).toEqual(bh2.timestamp.bn);
    expect(bh1.target).toEqual(bh2.target);
    expect(bh1.nonce).toEqual(bh2.nonce);
    expect(bh1.blockNum.bn).toEqual(bh2.blockNum.bn);
  });

  test.skip("isGenesis", () => {
    const bh1 = new Header({
      workSerAlgo: new U16BE(WORK_SER_ALGO_NUM.blake3_3),
      workParAlgo: new U16BE(WORK_PAR_ALGO_NUM.algo1627),
    });
    expect(bh1.isGenesis()).toBe(true);
  });

  test("clone", () => {
    const headerHex =
      "000001cc1b55d81c64b2cf4c1ef9577c2911551c650c1c6e8de73d8d4d3dff58949744cdf96442df0e8b45a7bf3f77fa35ff2ce98a7669cd55cd1d3d25b8eee0790000000000000002000001926352f88d0000001a0002cef0fe2831d9359f4974cf77cb57d9628e595752955eb1cdf9db50d40812000000000000000000000000000000000000000000000000000000000000011200030e562364eb9b72db7bc18408917f0b0082c91f9c01496f8bd36c57a496c0d6250001a06596b56530429f2fd168edee4dc9caef67d7b9077c9eaa1e6ca7c5f8336aca";
    const header = Header.fromHex(headerHex);
    const headerClone = header.clone();
    expect(header.toHex()).toBe(headerClone.toHex());
  });

  test("hash", () => {
    const bh1 = new Header();
    expect(bh1.hash().toHex()).toBe(
      "34b859ca751e26920aeb47b8e1e755f87293bda150c8cdc854964b7df7821bcf",
    );
  });

  test("id", () => {
    const bh1 = new Header();
    expect(bh1.id().toHex()).toBe(
      "f9d4c67f087b979dde480d0eb3bf99871ff09c6960f5aaa2a13a88092e2a0c29",
    );
  });

  test("mintTxAmount", () => {
    expect(Header.mintTxAmount(new U32BE(0n)).n).toEqual(10_000_000_000_000);
    expect(Header.mintTxAmount(new U32BE(210_000n)).n).toEqual(
      5_000_000_000_000,
    );
    expect(Header.mintTxAmount(new U32BE(420_000n)).n).toEqual(
      2_500_000_000_000,
    );
    expect(Header.mintTxAmount(new U32BE(630_000n)).n).toEqual(
      1_250_000_000_000,
    );
    expect(Header.mintTxAmount(new U32BE(840_000n)).n).toEqual(625_000_000_000);
    expect(Header.mintTxAmount(new U32BE(1_050_000n)).n).toEqual(
      312_500_000_000,
    );
    expect(Header.mintTxAmount(new U32BE(1_260_000n)).n).toEqual(
      156_250_000_000,
    );
  });

  test.skip("mintTxAmount 42 million", () => {
    let sum = 0n;
    for (let i = 0; i < 2_000_000; i++) {
      sum += Header.mintTxAmount(new U32BE(i)).bn;
    }
    // max u64: 18_446_744_073_709_551_616 - 1
    // max val:  4_193_945_312_500_000_000
    expect(sum).toBe(4_193_945_312_500_000_000n);
  });

  test("difficultyFromTarget", () => {
    const target1Hex =
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const target1Buf = FixedBuf.fromHex(32, target1Hex);
    const target1 = new BufReader(target1Buf.buf).readU256BE();
    const diff1 = Header.difficultyFromTarget(target1);
    expect(diff1.bn).toBe(1n);
    const target2Hex =
      "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const target2Buf = FixedBuf.fromHex(32, target2Hex);
    const target2 = new BufReader(target2Buf.buf).readU256BE();
    const diff2 = Header.difficultyFromTarget(target2);
    expect(diff2.bn).toBe(2n);
    const target3Hex =
      "0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const target3Buf = FixedBuf.fromHex(32, target3Hex);
    const target3 = new BufReader(target3Buf.buf).readU256BE();
    const diff3 = Header.difficultyFromTarget(target3);
    expect(diff3.bn).toBe(16n);
    const target4Hex =
      "07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const target4Buf = FixedBuf.fromHex(32, target4Hex);
    const target4 = new BufReader(target4Buf.buf).readU256BE();
    const diff4 = Header.difficultyFromTarget(target4);
    expect(diff4.bn).toBe(32n);
    const target5Hex =
      "00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const target5Buf = FixedBuf.fromHex(32, target5Hex);
    const target5 = new BufReader(target5Buf.buf).readU256BE();
    const diff5 = Header.difficultyFromTarget(target5);
    expect(diff5.bn).toBe(256n);
  });

  test("targetFromDifficulty", () => {
    const diff1 = new U64BE(1n);
    const target1 = Header.targetFromDifficulty(diff1);
    const target1Hex = new BufWriter()
      .writeU256BE(target1)
      .toBuf()
      .toString("hex");
    expect(target1Hex).toBe(
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );
    const diff2 = new U64BE(2n);
    const target2 = Header.targetFromDifficulty(diff2);
    const target2Hex = new BufWriter()
      .writeU256BE(target2)
      .toBuf()
      .toString("hex");
    expect(target2Hex).toBe(
      "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );
    const diff3 = new U64BE(16n);
    const target3 = Header.targetFromDifficulty(diff3);
    const target3Hex = new BufWriter()
      .writeU256BE(target3)
      .toBuf()
      .toString("hex");
    expect(target3Hex).toBe(
      "0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );
    const diff4 = new U64BE(32n);
    const target4 = Header.targetFromDifficulty(diff4);
    const target4Hex = new BufWriter()
      .writeU256BE(target4)
      .toBuf()
      .toString("hex");
    expect(target4Hex).toBe(
      "07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );
    const diff5 = new U64BE(256n);
    const target5 = Header.targetFromDifficulty(diff5);
    const target5Hex = new BufWriter()
      .writeU256BE(target5)
      .toBuf()
      .toString("hex");
    expect(target5Hex).toBe(
      "00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    );
  });

  test("difficulty", () => {
    const bh1 = new Header({
      target: new U256BE(
        0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
      ),
    });
    expect(bh1.difficulty().bn).toBe(65535n);
  });

  // describe("newDifficultyFromPrevHeaders", () => {
  //   test("newDifficultyFromPrevHeaders", () => {
  //     const prevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(600_000),
  //     });
  //     const prevPrevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(0),
  //     });
  //     const difficulty = Header.newDifficultyFromPrevHeaders(
  //       prevHeader,
  //       prevPrevHeader,
  //     );
  //     expect(difficulty.bn).toBe(65535n);
  //   });

  //   test("newDifficultyFromPrevHeaders", () => {
  //     const prevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(1_200_000),
  //     });
  //     const prevPrevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(0),
  //     });
  //     const difficulty = Header.newDifficultyFromPrevHeaders(
  //       prevHeader,
  //       prevPrevHeader,
  //     );
  //     expect(difficulty.bn).toBe(32767n);
  //   });

  //   test("newDifficultyFromPrevHeaders", () => {
  //     const prevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(300_000),
  //     });
  //     const prevPrevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(0),
  //     });
  //     const difficulty = Header.newDifficultyFromPrevHeaders(
  //       prevHeader,
  //       prevPrevHeader,
  //     );
  //     expect(difficulty.bn).toBe(131070n);
  //   });

  //   test("newDifficultyFromPrevHeaders", () => {
  //     const prevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(1),
  //     });
  //     const prevPrevHeader = new Header({
  //       target: new U256(
  //         0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
  //       ),
  //       timestamp: new U64(0),
  //     });
  //     const difficulty = Header.newDifficultyFromPrevHeaders(
  //       prevHeader,
  //       prevPrevHeader,
  //     );
  //     expect(difficulty.bn).toBe(262140n);
  //   });
  // });
});
