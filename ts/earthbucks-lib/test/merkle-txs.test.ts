import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleTxs } from "../src/merkle-txs.js";
import { Tx } from "../src/tx.js";
import { SysBuf } from "../src/buf.js";
import { U8, U16, U32, U64 } from "../src/numbers.js";

describe("MerkleTxs", () => {
  test("verify with 1 tx", () => {
    const tx1 = new Tx(new U8(0), [], [], new U32(0n));
    const merkleTxs = MerkleTxs.fromTxs([tx1]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 2 txs", () => {
    const tx1 = new Tx(new U8(0), [], [], new U32(0n));
    const tx2 = new Tx(new U8(0), [], [], new U32(1n));
    const merkleTxs = MerkleTxs.fromTxs([tx1, tx2]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 3 txs", () => {
    const tx1 = new Tx(new U8(0), [], [], new U32(0n));
    const tx2 = new Tx(new U8(0), [], [], new U32(1n));
    const tx3 = new Tx(new U8(0), [], [], new U32(2n));
    const merkleTxs = MerkleTxs.fromTxs([tx1, tx2, tx3]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 4 txs", () => {
    const tx1 = new Tx(new U8(0), [], [], new U32(0n));
    const tx2 = new Tx(new U8(0), [], [], new U32(1n));
    const tx3 = new Tx(new U8(0), [], [], new U32(2n));
    const tx4 = new Tx(new U8(0), [], [], new U32(3n));
    const merkleTxs = MerkleTxs.fromTxs([tx1, tx2, tx3, tx4]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 5 txs", () => {
    const tx1 = new Tx(new U8(0), [], [], new U32(0n));
    const tx2 = new Tx(new U8(0), [], [], new U32(1n));
    const tx3 = new Tx(new U8(0), [], [], new U32(2n));
    const tx4 = new Tx(new U8(0), [], [], new U32(3n));
    const tx5 = new Tx(new U8(0), [], [], new U32(4n));
    const merkleTxs = MerkleTxs.fromTxs([tx1, tx2, tx3, tx4, tx5]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  describe("speed tests", () => {
    test.skip("verify with N=100000 txs", () => {
      console.time("verify with N=100000 txs");
      const txs = [];
      for (let i = 0; i < 100000; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=100000 txs");
    });

    test.skip("verify with N=43000 txs", () => {
      console.time("verify with N=43000 txs");
      const txs = [];
      for (let i = 0; i < 43000; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=43000 txs");
    });

    test.skip("verify with N=4300 txs", () => {
      console.time("verify with N=4300 txs");
      const txs = [];
      for (let i = 0; i < 4300; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=4300 txs");
    });

    test.skip("verify with N=430 txs", () => {
      console.time("verify with N=430 txs");
      const txs = [];
      for (let i = 0; i < 430; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=430 txs");
    });

    test.skip("verify with N=43 txs", () => {
      console.time("verify with N=43 txs");
      const txs = [];
      for (let i = 0; i < 43; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=43 txs");
    });

    test.skip("verify with N=100000 txs", () => {
      console.time("verify with N=100000 txs");
      const txs = [];
      for (let i = 0; i < 100000; i++) {
        const tx = new Tx(new U8(0), [], [], new U32(BigInt(i)));
        txs.push(tx);
      }
      const merkleTxs = MerkleTxs.fromTxs(txs);
      const verified = merkleTxs.verify();
      expect(verified).toBe(true);
      console.timeEnd("verify with N=100000 txs");
      console.time("add 1 tx");
      const tx = new Tx(new U8(0), [], [], new U32(100000n));
      const merkleTxs2 = merkleTxs.add(tx);
      const verified2 = merkleTxs2.verify();
      expect(verified2).toBe(true);
      console.timeEnd("add 1 tx");
    });
  });
});
