import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleProof } from "../src/merkle-proof.js";
import { Hash } from "../src/hash.js";
import { SysBuf } from "../src/buf.js";
import { MerkleTree } from "../src/merkle-tree.js";

describe("MerkleProof", () => {
  it("should generate and verify a MerkleProof", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const root = MerkleTree.fromLeafHashes([data1, data2]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const verified2 = merkleProof.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const root = MerkleTree.fromLeafHashes([data1, data2]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (3)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const root = MerkleTree.fromLeafHashes([data1, data2, data3]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (4)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (5)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
    const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4, data5]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (6)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
    const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
    const root = MerkleTree.fromLeafHashes([
      data1,
      data2,
      data3,
      data4,
      data5,
      data6,
    ]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (7)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
    const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
    const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
    const root = MerkleTree.fromLeafHashes([
      data1,
      data2,
      data3,
      data4,
      data5,
      data6,
      data7,
    ]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (8)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
    const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
    const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
    const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
    const root = MerkleTree.fromLeafHashes([
      data1,
      data2,
      data3,
      data4,
      data5,
      data6,
      data7,
      data8,
    ]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });

  it("should verify after encoding to/from hex (9)", () => {
    const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
    const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
    const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
    const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
    const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
    const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
    const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
    const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
    const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
    const root = MerkleTree.fromLeafHashes([
      data1,
      data2,
      data3,
      data4,
      data5,
      data6,
      data7,
      data8,
      data9,
    ]);
    const proof = root.getProof(0);
    const verified = MerkleTree.verifyProof(root.hash, proof, data1);
    const merkleProof = new MerkleProof(root.hash, proof);
    const hex = merkleProof.toHex();
    const merkleProof2 = MerkleProof.fromHex(hex);
    const verified2 = merkleProof2.verify(data1);
    expect(verified).toBe(true);
    expect(verified2).toBe(true);
  });
});
