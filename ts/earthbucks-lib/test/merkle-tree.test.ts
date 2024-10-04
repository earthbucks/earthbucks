import { describe, expect, test } from "vitest";
import { MerkleTree } from "../src/merkle-tree.js";
import { Hash } from "../src/hash.js";
import { SysBuf } from "../src/buf.js";
import { FixedBuf } from "../src/buf.js";

describe("MerkleTree", () => {
  describe("computeAllLeaves", () => {
    test("should return these known values", () => {
      expect(MerkleTree.computeAllLeavesForBalancedTree(0)).toBe(0);
      expect(MerkleTree.computeAllLeavesForBalancedTree(1)).toBe(1);
      expect(MerkleTree.computeAllLeavesForBalancedTree(2)).toBe(2);
      expect(MerkleTree.computeAllLeavesForBalancedTree(3)).toBe(4);
      expect(MerkleTree.computeAllLeavesForBalancedTree(4)).toBe(4);
      expect(MerkleTree.computeAllLeavesForBalancedTree(5)).toBe(8);
      expect(MerkleTree.computeAllLeavesForBalancedTree(6)).toBe(8);
      expect(MerkleTree.computeAllLeavesForBalancedTree(7)).toBe(8);
      expect(MerkleTree.computeAllLeavesForBalancedTree(8)).toBe(8);
      expect(MerkleTree.computeAllLeavesForBalancedTree(9)).toBe(16);
    });
  });

  describe("fromLeafHashes", () => {
    test("fromLeafHashes with 0 data", () => {
      const data: FixedBuf<32>[] = [];
      const root = MerkleTree.fromLeafHashes(data);
      expect(root.hash).toBe(null);
    });

    test("fromLeafHashes with 1 data", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));

      const data = [data1];
      const root = MerkleTree.fromLeafHashes(data);
      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
      );
      expect(root.countNonNullLeaves()).toBe(1);
      expect(root.countAllLeaves()).toBe(1);
      expect(root.leftHeight()).toBe(1);
      expect(root.isNullBalanced()).toBe(true);
    });

    test("fromLeafHashes with 2 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

      const data = [data1, data2];
      const root = MerkleTree.fromLeafHashes(data);
      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
      );
      expect(root.countNonNullLeaves()).toBe(2);
      expect(root.countAllLeaves()).toBe(2);
      expect(root.leftHeight()).toBe(2);
      expect(root.isNullBalanced()).toBe(true);
    });

    test("fromLeafHashes with 3 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data2, data3];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
      );
      expect(root.countNonNullLeaves()).toBe(3);
      expect(root.countAllLeaves()).toBe(4);
      expect(root.leftHeight()).toBe(3);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.hash).toBe(null);
    });

    test("fromLeafHashes with 3 datas (not null balanced)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data2, data3];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
      );
      expect(root.countNonNullLeaves()).toBe(3);
      expect(root.countAllLeaves()).toBe(4);
      expect(root.leftHeight()).toBe(3);
      if (root.right) {
        root.right.right = null;
      }
      expect(root.isNullBalanced()).toBe(false);
      expect(root.right?.right).toBe(null);
    });

    test("fromLeafHashes with 4 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));

      const data = [data1, data2, data3, data4];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187",
      );
      expect(root.countNonNullLeaves()).toBe(4);
      expect(root.countAllLeaves()).toBe(4);
      expect(root.leftHeight()).toBe(3);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.hash).not.toBe(null);
    });

    test("fromLeafHashes with 5 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));

      const data = [data1, data2, data3, data4, data5];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "1f040d231d6732ef29ddae2c5967d91d0e3601d697bfa916ccde260cee95853e",
      );
      expect(root.countNonNullLeaves()).toBe(5);
      expect(root.countAllLeaves()).toBe(8);
      expect(root.leftHeight()).toBe(4);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.right?.hash).toBe(null);
    });

    test("fromLeafHashes with 6 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));

      const data = [data1, data2, data3, data4, data5, data6];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "0a99849dca28e5cef3a571552a3191331cea101e906c7a6032e3156c779bc6b5",
      );
      expect(root.countNonNullLeaves()).toBe(6);
      expect(root.countAllLeaves()).toBe(8);
      expect(root.leftHeight()).toBe(4);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.right?.hash).toBe(null);
    });

    test("fromLeafHashes with 7 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));

      const data = [data1, data2, data3, data4, data5, data6, data7];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "83c209a9c2ca33de365378f9b87c5b365f422763cd5ed4cf10217e35e6d9690b",
      );
      expect(root.countNonNullLeaves()).toBe(7);
      expect(root.countAllLeaves()).toBe(8);
      expect(root.leftHeight()).toBe(4);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.right?.hash).toBe(null);
    });

    test("fromLeafHashes with 8 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));

      const data = [data1, data2, data3, data4, data5, data6, data7, data8];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fc4b21e6bdd266c1808fe1f511d0da1eaf7a589ba581b580bb8cb6bb1d8663d6",
      );
      expect(root.countNonNullLeaves()).toBe(8);
      expect(root.countAllLeaves()).toBe(8);
      expect(root.leftHeight()).toBe(4);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.right?.hash).not.toBe(null);
    });

    test("fromLeafHashes with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);

      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(root.countNonNullLeaves()).toBe(9);
      expect(root.countAllLeaves()).toBe(16);
      expect(root.leftHeight()).toBe(5);
      expect(root.isNullBalanced()).toBe(true);
      expect(root.right?.right?.right?.right?.hash).toBe(null);
    });
  });

  describe("doubleWithNulls", () => {
    test("doubleWithNulls with null", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

      const data = [data1, data2];
      const root = MerkleTree.fromLeafHashes(data);

      const node = root.doubleWithNulls();
      expect(node.countAllLeaves()).toBe(4);
    });
  });

  describe("updateBalancedLeafHash", () => {
    test("updateBalancedLeafHash with 0 data", () => {
      const data: FixedBuf<32>[] = [];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(
        0,
        Hash.doubleBlake3Hash(SysBuf.from("data1")),
      );
      expect(updated.hash?.buf.toString("hex")).toBe(
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
      );
    });

    test("updateBalancedLeafHash with 1 data", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

      const data = [data1];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(0, data2);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "d5984dbb2273f9cbb7467a1d6c9c2aa2a4641ffda555085cd707c988725e1348",
      );
      expect(updated.countNonNullLeaves()).toBe(1);
      expect(updated.countAllLeaves()).toBe(1);
      expect(updated.leftHeight()).toBe(1);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test("updateBalancedLeafHash with 2 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data2];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(1, data3);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a23f5aaa95e1d53252fbe0d70e733b68ea9478e5cb02bbb96fc3a1b52f75a6c0",
      );
      expect(updated.countNonNullLeaves()).toBe(2);
      expect(updated.countAllLeaves()).toBe(2);
      expect(updated.leftHeight()).toBe(2);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test("updateBalancedLeafHash with 2 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data3];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(1, data2);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
      );
      expect(updated.countNonNullLeaves()).toBe(2);
      expect(updated.countAllLeaves()).toBe(2);
      expect(updated.leftHeight()).toBe(2);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test("updateBalancedLeafHash with 3 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));

      const data = [data1, data2, data3];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(2, data4);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "980fdccf33e0a0d6eed0b95b60a8bcf3abc9b16897677b11200db1e09b11459a",
      );
      expect(updated.countNonNullLeaves()).toBe(3);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 3 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));

      const data = [data1, data2, data4];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(2, data3);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
      );
      expect(updated.countNonNullLeaves()).toBe(3);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 4 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));

      const data = [data1, data2, data3, data4];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(3, data5);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "6f1192abae62672bb143537631187d5ad437ee8a836d7f4678c96c1abc0fad51",
      );
      expect(updated.countNonNullLeaves()).toBe(4);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.hash).not.toBe(null);
    });

    test("updateBalancedLeafHash with 4 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));

      const data = [data1, data2, data3, data5];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(3, data4);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187",
      );
      expect(updated.countNonNullLeaves()).toBe(4);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.hash).not.toBe(null);
    });

    test("updateBalancedLeafHash with 5 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));

      const data = [data1, data2, data3, data4, data5];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(4, data6);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "669acf642fe7dd36baf6b7540f0675ee28dac32c8f224da7ea1c10642d5df34c",
      );
      expect(updated.countNonNullLeaves()).toBe(5);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 5 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));

      const data = [data1, data2, data3, data4, data6];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(4, data5);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "1f040d231d6732ef29ddae2c5967d91d0e3601d697bfa916ccde260cee95853e",
      );
      expect(updated.countNonNullLeaves()).toBe(5);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 6 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));

      const data = [data1, data2, data3, data4, data5, data6];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(5, data7);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "d5c17db72e9a3622e6c30f6e239b74cca88cf233b95e3a2bd4e200779aed4037",
      );
      expect(updated.countNonNullLeaves()).toBe(6);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 6 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));

      const data = [data1, data2, data3, data4, data5, data7];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(5, data6);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "0a99849dca28e5cef3a571552a3191331cea101e906c7a6032e3156c779bc6b5",
      );
      expect(updated.countNonNullLeaves()).toBe(6);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 7 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));

      const data = [data1, data2, data3, data4, data5, data6, data7];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(6, data8);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "6dfca8749b922cafe396afe2d1abbe403359ab43dd1b55d8bd7f7f0fee55bcd2",
      );
      expect(updated.countNonNullLeaves()).toBe(7);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 7 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));

      const data = [data1, data2, data3, data4, data5, data6, data8];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(6, data7);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "83c209a9c2ca33de365378f9b87c5b365f422763cd5ed4cf10217e35e6d9690b",
      );
      expect(updated.countNonNullLeaves()).toBe(7);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 8 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));

      const data = [data1, data2, data3, data4, data5, data6, data7, data8];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(7, data9);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a8a546edfca881dcb38257ef3b3f58429ea60e766443eaf3dfaef3d2cca78474",
      );
      expect(updated.countNonNullLeaves()).toBe(8);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).not.toBe(null);
    });

    test("updateBalancedLeafHash with 8 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));

      const data = [data1, data2, data3, data4, data5, data6, data7, data9];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(7, data8);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fc4b21e6bdd266c1808fe1f511d0da1eaf7a589ba581b580bb8cb6bb1d8663d6",
      );
      expect(updated.countNonNullLeaves()).toBe(8);
      expect(updated.countAllLeaves()).toBe(8);
      expect(updated.leftHeight()).toBe(4);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.hash).not.toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(8, data10);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "b78d36ababee39eda8811558f9f1056eb68d0c9d5d42b4fe686f7868731a7671",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        data7,
        data8,
        data10,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(8, data9);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        data7,
        data10,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(7, data8);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data6,
        data10,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(6, data7);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data5,
        data10,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(5, data6);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data4,
        data10,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(4, data5);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data3,
        data10,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(3, data4);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data2,
        data10,
        data4,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(2, data3);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data1,
        data10,
        data3,
        data4,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(1, data2);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });

    test("updateBalancedLeafHash with 9 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));
      const data9 = Hash.doubleBlake3Hash(SysBuf.from("data9"));
      const data10 = Hash.doubleBlake3Hash(SysBuf.from("data10"));

      const data = [
        data10,
        data2,
        data3,
        data4,
        data5,
        data6,
        data7,
        data8,
        data9,
      ];
      const root = MerkleTree.fromLeafHashes(data);
      const updated = root.updateBalancedLeafHash(0, data1);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "3e06525407179359e4a621666300ff852e931f2f2b511353f133589bcf63e487",
      );
      expect(updated.countNonNullLeaves()).toBe(9);
      expect(updated.countAllLeaves()).toBe(16);
      expect(updated.leftHeight()).toBe(5);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.right?.right?.right?.right?.hash).toBe(null);
    });
  });

  describe("addLeafHash", () => {
    test("addLeafHash with 1 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const root = MerkleTree.fromLeafHashes([]);
      const updated = root.addLeafHash(data1);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
      );
      expect(updated.countNonNullLeaves()).toBe(1);
      expect(updated.countAllLeaves()).toBe(1);
      expect(updated.leftHeight()).toBe(1);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.hash?.toHex()).toBe(
        MerkleTree.fromLeafHashes([data1]).hash?.toHex(),
      );
    });

    test("addLeafHash with 2 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const root = MerkleTree.fromLeafHashes([data1]);
      const updated = root.addLeafHash(data2);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
      );
      expect(updated.countNonNullLeaves()).toBe(2);
      expect(updated.countAllLeaves()).toBe(2);
      expect(updated.leftHeight()).toBe(2);
      expect(updated.isNullBalanced()).toBe(true);
      expect(updated.hash?.toHex()).toBe(
        MerkleTree.fromLeafHashes([data1, data2]).hash?.toHex(),
      );
    });

    test("addLeafHash with 3 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const root = MerkleTree.fromLeafHashes([data1, data2]);
      const updated = root.addLeafHash(data3);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
      );
      expect(updated.countNonNullLeaves()).toBe(3);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
      // expect(updated.hash?.toHex()).toBe(MerkleTree.fromLeafHashes([data1, data2, data3]).hash?.toHex());
    });

    test.skip("benchmark: addLeafHash with 1000 total", () => {
      console.time("addLeafHash with 1000 total");
      const datas = Array.from({ length: 1000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleTree.fromLeafHashes(datas);
      console.timeEnd("addLeafHash with 1000 total");
      console.time("add 1");
      const updated = root.addLeafHash(dataN);
      console.timeEnd("add 1");

      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "72258d258cdb70b31a92ed2f0b5d9487cf1e0f458763bd9fdc972ca81aadb602",
      );
      expect(updated.countNonNullLeaves()).toBe(1001);
      expect(updated.countAllLeaves()).toBe(1024);
      expect(updated.leftHeight()).toBe(11);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test.skip("benchmark: addLeafHash with 10000 total", () => {
      console.time("addLeafHash with 10000 total");
      const datas = Array.from({ length: 10000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleTree.fromLeafHashes(datas);
      console.timeEnd("addLeafHash with 10000 total");
      console.time("add 1");
      const updated = root.addLeafHash(dataN);
      console.timeEnd("add 1");

      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "4cfd5a35e0a617167d3bf6d6a2e47edc65be423ee85f30adbaee93a252871da0",
      );
      expect(updated.countNonNullLeaves()).toBe(10001);
      expect(updated.countAllLeaves()).toBe(16384);
      expect(updated.leftHeight()).toBe(15);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test.skip("benchmark: addLeafHash with 100000 total", () => {
      console.time("addLeafHash with 100000 total");
      const datas = Array.from({ length: 100000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleTree.fromLeafHashes(datas);
      console.timeEnd("addLeafHash with 100000 total");
      console.time("add 1");
      const updated = root.addLeafHash(dataN);
      console.timeEnd("add 1");

      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "894cf1344d26baba0cad0efa580e03268130023591dcdecbfa724af253e9c0b1",
      );
      expect(updated.countNonNullLeaves()).toBe(100001);
      expect(updated.countAllLeaves()).toBe(131072);
      expect(updated.leftHeight()).toBe(18);
      expect(updated.isNullBalanced()).toBe(true);
    });
  });

  describe("merkle proofs", () => {
    test("get proof with 1 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const root = MerkleTree.fromLeafHashes([data1]);
      const proof = root.getProof(0);
      expect(proof).toEqual([]);
    });

    test("get proof with 2 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const root = MerkleTree.fromLeafHashes([data1, data2]);
      const proof = root.getMerkleProof(0);
      expect(proof.toHex()).toEqual(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde01d5984dbb2273f9cbb7467a1d6c9c2aa2a4641ffda555085cd707c988725e134801",
      );
    });

    test("get proof and verify (1)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const root = MerkleTree.fromLeafHashes([data1]);
      const proof = root.getProof(0);
      const verified = MerkleTree.verifyProof(root.hash, proof, data1);
      expect(verified).toBe(true);
    });

    test("get proof and verify (2)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const root = MerkleTree.fromLeafHashes([data1, data2]);
      const proof = root.getProof(0);
      const verified = MerkleTree.verifyProof(root.hash, proof, data1);
      expect(verified).toBe(true);
    });

    test("get proof and verify (3,1)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3]);
      const proof = root.getProof(0);
      const verified = MerkleTree.verifyProof(root.hash, proof, data1);
      expect(verified).toBe(true);
    });

    test("get proof and verify (3,2)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3]);
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (3,3)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3]);
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (4,1)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4]);
      const proof = root.getProof(0);
      const verified = MerkleTree.verifyProof(root.hash, proof, data1);
      expect(verified).toBe(true);
    });

    test("get proof and verify (4,2)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4]);
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (4,3)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4]);
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (4,4)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const root = MerkleTree.fromLeafHashes([data1, data2, data3, data4]);
      const proof = root.getProof(3);
      const verified = MerkleTree.verifyProof(root.hash, proof, data4);
      expect(verified).toBe(true);
    });

    test("get proof and verify (5,1)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const root = MerkleTree.fromLeafHashes([
        data1,
        data2,
        data3,
        data4,
        data5,
      ]);
      const proof = root.getProof(0);
      const verified = MerkleTree.verifyProof(root.hash, proof, data1);
      expect(verified).toBe(true);
    });

    test("get proof and verify (5,2)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const root = MerkleTree.fromLeafHashes([
        data1,
        data2,
        data3,
        data4,
        data5,
      ]);
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (5,3)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const root = MerkleTree.fromLeafHashes([
        data1,
        data2,
        data3,
        data4,
        data5,
      ]);
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (5,4)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const root = MerkleTree.fromLeafHashes([
        data1,
        data2,
        data3,
        data4,
        data5,
      ]);
      const proof = root.getProof(3);
      const verified = MerkleTree.verifyProof(root.hash, proof, data4);
      expect(verified).toBe(true);
    });

    test("get proof and verify (5,5)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const root = MerkleTree.fromLeafHashes([
        data1,
        data2,
        data3,
        data4,
        data5,
      ]);
      const proof = root.getProof(4);
      const verified = MerkleTree.verifyProof(root.hash, proof, data5);
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,1)", () => {
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
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,2)", () => {
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
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,3)", () => {
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
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,4)", () => {
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
      const proof = root.getProof(3);
      const verified = MerkleTree.verifyProof(root.hash, proof, data4);
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,5)", () => {
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
      const proof = root.getProof(4);
      const verified = MerkleTree.verifyProof(root.hash, proof, data5);
      expect(verified).toBe(true);
    });

    test("get proof and verify (6,6)", () => {
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
      const proof = root.getProof(5);
      const verified = MerkleTree.verifyProof(root.hash, proof, data6);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,1)", () => {
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
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,2)", () => {
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
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,3)", () => {
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
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,4)", () => {
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
      const proof = root.getProof(3);
      const verified = MerkleTree.verifyProof(root.hash, proof, data4);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,5)", () => {
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
      const proof = root.getProof(4);
      const verified = MerkleTree.verifyProof(root.hash, proof, data5);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,6)", () => {
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
      const proof = root.getProof(5);
      const verified = MerkleTree.verifyProof(root.hash, proof, data6);
      expect(verified).toBe(true);
    });

    test("get proof and verify (7,7)", () => {
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
      const proof = root.getProof(6);
      const verified = MerkleTree.verifyProof(root.hash, proof, data7);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,1)", () => {
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
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,2)", () => {
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
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,3)", () => {
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
      const proof = root.getProof(2);
      const verified = MerkleTree.verifyProof(root.hash, proof, data3);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,4)", () => {
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
      const proof = root.getProof(3);
      const verified = MerkleTree.verifyProof(root.hash, proof, data4);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,5)", () => {
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
      const proof = root.getProof(4);
      const verified = MerkleTree.verifyProof(root.hash, proof, data5);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,6)", () => {
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
      const proof = root.getProof(5);
      const verified = MerkleTree.verifyProof(root.hash, proof, data6);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,7)", () => {
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
      const proof = root.getProof(6);
      const verified = MerkleTree.verifyProof(root.hash, proof, data7);
      expect(verified).toBe(true);
    });

    test("get proof and verify (8,8)", () => {
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
      const proof = root.getProof(7);
      const verified = MerkleTree.verifyProof(root.hash, proof, data8);
      expect(verified).toBe(true);
    });

    test("get proof and verify (9,1)", () => {
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
      expect(verified).toBe(true);
    });

    test("get proof and verify (9,2)", () => {
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
      const proof = root.getProof(1);
      const verified = MerkleTree.verifyProof(root.hash, proof, data2);
      expect(verified).toBe(true);
    });
  });

  describe("known test vector", () => {
    // 0 eb98fe446d8700d24dbc6ac15dd01f8bfa2f21066bd8551df6ab4f4035ec222e
    // 1 3e3b5c31406ea4b807390fddd3361160dcf660920d8e2cafc0718eb30f9664f7
    // 2 771461ad0edea2ed7a3910180f3eea6b6d6865798dfe256cd538e61953f227e8
    // 3 17d244a5c34214dee9213f13666ac26435178e243c75e492bd265aecceceee36
    // 4 f7b61ef957a9ac75b4e12ceff6e0e2c69ad2df9b5dff86840087dc50915f9d90
    // 5 44d6042f0228ea7bceff8426fc279220ad450336c9eda37ceec308f4ba1c0ade
    // 6 70ae958625ceef4f2737aa474f2084344f4a0f45dff36616220f12a88bbd08de
    // 7 b77c13d4ed3c4e5db30e05fbc9df0442d13620c6a1f984a03196c8e5a7acc46c
    // 8 fa40f1a339c70b8bbaa0163b1c9997b6e2987d3feb5d8279ac75b06ea66ed35f
    // 9 4badf13915f8837096ee1430ddd0e4aa4828645d530b13887adc07843cc0a4e1
    // 10 4a80b66e2eae3ae8d5ab4d335402cb8011be680d21be9a0f2398091d01bf39ee
    // 11 76f85e1a6fb1e2f9be5f7c1e1625d73b9ca904c8cf07482d449e81f2a1872a60
    // 12 042e51740d26302d3f00cbe829d909b3f034a1ce870ef4f36238d398d5751e59
    // 13 beaaf815b6e25f147f7ccdf8d1e0d4d005bacacb675dff2cccb61d16bb622f1b
    // 14 d086a510c67c8b0490ffb2da22716c6f6b3255136a0c0c46a710948456861eb7
    // 15 dc74c1192249ee5ba59841eb11c738b1a3536988d3af14da0ad9f59c60d090a9
    // 16 c950e606a9f02889a1a4f34a2f627d39d6d6c0785a980dc4d0ca9d6977f6ae6e
    // 17 647eb00f3692cdb4bb2dae4cb45943d8bc1faa9565de9fd82d554c714051b217
    // 18 463b1aeae436e60e3ab216a65a663d7e86bb4f3ed86ef77e70807de8ded3c535
    // 19 2778a6850154a47436e65e76f01f4d5a3254f99698679ffc1ca3cea325cbfead
    // 20 26bfa42d5b045574a8e634acb1c0e20af2632c164e8e186cfc798b84e10fb5bc
    // 21 b9e4020e38b72742966e29115ff64899e66f852247e9fbb5791e29020732278f
    // 22 1932e659b99d326ea383c95b1ebcd30ece71ebedd2b9899eaac44a0575c8ac2b
    // 23 c00e419615486b5babee54cb88b290622967ab62e5f522c5e32b58f124ef922f
    // 24 e323b34467667d1df8322e59f31c96e1d519d6e585a28a43fea110b3cbcdccc8
    // 25 1d817bedfc620f8de01f5c5260e6ab090f5dcab455803ed14e6a67b8d5f866ff
    // 26 3ac1fb79f0028243e1a936aeb14706da3d254538acedd58d3b774f7b5b5cedf9
    // 27 0bcf703239cf9bb5b6e9a876896edda8103633c91368403be38f77b491fc3aee
    const hashes = [
      FixedBuf.fromHex(
        32,
        "eb98fe446d8700d24dbc6ac15dd01f8bfa2f21066bd8551df6ab4f4035ec222e",
      ),
      FixedBuf.fromHex(
        32,
        "3e3b5c31406ea4b807390fddd3361160dcf660920d8e2cafc0718eb30f9664f7",
      ),
      FixedBuf.fromHex(
        32,
        "771461ad0edea2ed7a3910180f3eea6b6d6865798dfe256cd538e61953f227e8",
      ),
      FixedBuf.fromHex(
        32,
        "17d244a5c34214dee9213f13666ac26435178e243c75e492bd265aecceceee36",
      ),
      FixedBuf.fromHex(
        32,
        "f7b61ef957a9ac75b4e12ceff6e0e2c69ad2df9b5dff86840087dc50915f9d90",
      ),
      FixedBuf.fromHex(
        32,
        "44d6042f0228ea7bceff8426fc279220ad450336c9eda37ceec308f4ba1c0ade",
      ),
      FixedBuf.fromHex(
        32,
        "70ae958625ceef4f2737aa474f2084344f4a0f45dff36616220f12a88bbd08de",
      ),
      FixedBuf.fromHex(
        32,
        "b77c13d4ed3c4e5db30e05fbc9df0442d13620c6a1f984a03196c8e5a7acc46c",
      ),
      FixedBuf.fromHex(
        32,
        "fa40f1a339c70b8bbaa0163b1c9997b6e2987d3feb5d8279ac75b06ea66ed35f",
      ),
      FixedBuf.fromHex(
        32,
        "4badf13915f8837096ee1430ddd0e4aa4828645d530b13887adc07843cc0a4e1",
      ),
      FixedBuf.fromHex(
        32,
        "4a80b66e2eae3ae8d5ab4d335402cb8011be680d21be9a0f2398091d01bf39ee",
      ),
      FixedBuf.fromHex(
        32,
        "76f85e1a6fb1e2f9be5f7c1e1625d73b9ca904c8cf07482d449e81f2a1872a60",
      ),
      FixedBuf.fromHex(
        32,
        "042e51740d26302d3f00cbe829d909b3f034a1ce870ef4f36238d398d5751e59",
      ),
      FixedBuf.fromHex(
        32,
        "beaaf815b6e25f147f7ccdf8d1e0d4d005bacacb675dff2cccb61d16bb622f1b",
      ),
      FixedBuf.fromHex(
        32,
        "d086a510c67c8b0490ffb2da22716c6f6b3255136a0c0c46a710948456861eb7",
      ),
      FixedBuf.fromHex(
        32,
        "dc74c1192249ee5ba59841eb11c738b1a3536988d3af14da0ad9f59c60d090a9",
      ),
      FixedBuf.fromHex(
        32,
        "c950e606a9f02889a1a4f34a2f627d39d6d6c0785a980dc4d0ca9d6977f6ae6e",
      ),
      FixedBuf.fromHex(
        32,
        "647eb00f3692cdb4bb2dae4cb45943d8bc1faa9565de9fd82d554c714051b217",
      ),
      FixedBuf.fromHex(
        32,
        "463b1aeae436e60e3ab216a65a663d7e86bb4f3ed86ef77e70807de8ded3c535",
      ),
      FixedBuf.fromHex(
        32,
        "2778a6850154a47436e65e76f01f4d5a3254f99698679ffc1ca3cea325cbfead",
      ),
      FixedBuf.fromHex(
        32,
        "26bfa42d5b045574a8e634acb1c0e20af2632c164e8e186cfc798b84e10fb5bc",
      ),
      FixedBuf.fromHex(
        32,
        "b9e4020e38b72742966e29115ff64899e66f852247e9fbb5791e29020732278f",
      ),
      FixedBuf.fromHex(
        32,
        "1932e659b99d326ea383c95b1ebcd30ece71ebedd2b9899eaac44a0575c8ac2b",
      ),
      FixedBuf.fromHex(
        32,
        "c00e419615486b5babee54cb88b290622967ab62e5f522c5e32b58f124ef922f",
      ),
      FixedBuf.fromHex(
        32,
        "e323b34467667d1df8322e59f31c96e1d519d6e585a28a43fea110b3cbcdccc8",
      ),
      FixedBuf.fromHex(
        32,
        "1d817bedfc620f8de01f5c5260e6ab090f5dcab455803ed14e6a67b8d5f866ff",
      ),
      FixedBuf.fromHex(
        32,
        "3ac1fb79f0028243e1a936aeb14706da3d254538acedd58d3b774f7b5b5cedf9",
      ),
      FixedBuf.fromHex(
        32,
        "0bcf703239cf9bb5b6e9a876896edda8103633c91368403be38f77b491fc3aee",
      ),
    ];

    test("should match fromLeafHashes and addLeafHashes: len 1", () => {
      const arr1 = hashes.slice(0, 1);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 2", () => {
      const arr1 = hashes.slice(0, 1);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 3", () => {
      const arr1 = hashes.slice(0, 3);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 4", () => {
      const arr1 = hashes.slice(0, 4);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 5", () => {
      const arr1 = hashes.slice(0, 5);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 6", () => {
      const arr1 = hashes.slice(0, 6);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 7", () => {
      const arr1 = hashes.slice(0, 7);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 8", () => {
      const arr1 = hashes.slice(0, 8);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 9", () => {
      const arr1 = hashes.slice(0, 9);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 10", () => {
      const arr1 = hashes.slice(0, 10);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 11", () => {
      const arr1 = hashes.slice(0, 11);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 12", () => {
      const arr1 = hashes.slice(0, 12);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 13", () => {
      const arr1 = hashes.slice(0, 13);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 14", () => {
      const arr1 = hashes.slice(0, 14);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 15", () => {
      const arr1 = hashes.slice(0, 15);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 16", () => {
      const arr1 = hashes.slice(0, 16);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 17", () => {
      const arr1 = hashes.slice(0, 17);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 18", () => {
      const arr1 = hashes.slice(0, 18);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 19", () => {
      const arr1 = hashes.slice(0, 19);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 20", () => {
      const arr1 = hashes.slice(0, 20);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 21", () => {
      const arr1 = hashes.slice(0, 21);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 22", () => {
      const arr1 = hashes.slice(0, 22);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 23", () => {
      const arr1 = hashes.slice(0, 23);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 24", () => {
      const arr1 = hashes.slice(0, 24);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 25", () => {
      const arr1 = hashes.slice(0, 25);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 26", () => {
      const arr1 = hashes.slice(0, 26);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("should match fromLeafHashes and addLeafHashes: len 27", () => {
      const arr1 = hashes.slice(0, 27);
      const mt1 = MerkleTree.fromLeafHashes(arr1);
      const mt2 = new MerkleTree().addLeafHashes(arr1);
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("addLeafHash with 3 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const mt1 = new MerkleTree().addLeafHash(data1).addLeafHash(data2);
      const mt2 = MerkleTree.fromLeafHashes([data1, data2]);
      expect(mt1.hash?.toHex()).toEqual(
        Hash.doubleBlake3Hash(
          MerkleTree.concat(
            mt1.left?.computeHash() || null,
            mt1.right?.computeHash() || null,
          ),
        ).toHex(),
      );
      expect(mt2.hash?.toHex()).toEqual(
        Hash.doubleBlake3Hash(
          MerkleTree.concat(
            mt2.left?.computeHash() || null,
            mt2.right?.computeHash() || null,
          ),
        ).toHex(),
      );
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });

    test("addLeafHash with 3 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const mt1 = new MerkleTree()
        .addLeafHash(data1)
        .addLeafHash(data2)
        .addLeafHash(data3);
      const mt2 = MerkleTree.fromLeafHashes([data1, data2, data3]);
      expect(mt1.hash?.toHex()).toEqual(
        Hash.doubleBlake3Hash(
          MerkleTree.concat(
            mt1.left?.computeHash() || null,
            mt1.right?.computeHash() || null,
          ),
        ).toHex(),
      );
      expect(mt2.hash?.toHex()).toEqual(
        Hash.doubleBlake3Hash(
          MerkleTree.concat(
            mt2.left?.computeHash() || null,
            mt2.right?.computeHash() || null,
          ),
        ).toHex(),
      );
      expect(mt1.hash?.toHex()).toEqual(mt2.hash?.toHex());
    });
  });
});
