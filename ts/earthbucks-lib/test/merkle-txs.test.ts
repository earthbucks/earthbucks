import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleTxs } from "../src/merkle-txs";
import { Tx } from "../src/tx";
import { IsoBuf } from "../src/iso-buf";

describe("MerkleTxs", () => {
  test("verify with 1 tx", () => {
    const tx1 = new Tx(0, [], [], 0n);
    const merkleTxs = new MerkleTxs([tx1]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 2 txs", () => {
    const tx1 = new Tx(0, [], [], 0n);
    const tx2 = new Tx(0, [], [], 0n);
    const merkleTxs = new MerkleTxs([tx1, tx2]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });

  test("verify with 3 txs", () => {
    const tx1 = new Tx(0, [], [], 0n);
    const tx2 = new Tx(0, [], [], 0n);
    const tx3 = new Tx(0, [], [], 0n);
    const merkleTxs = new MerkleTxs([tx1, tx2, tx3]);
    const verified = merkleTxs.verify();
    expect(verified).toBe(true);
  });
});
