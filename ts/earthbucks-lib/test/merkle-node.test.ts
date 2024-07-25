import { describe, expect, test, beforeEach, it } from "vitest";
import { MerkleNode } from "../src/merkle-node.js";
import { Hash } from "../src/hash.js";
import { SysBuf } from "../src/buf.js";
import type { FixedBuf } from "../src/buf.js";

describe("MerkleNode", () => {
  describe("fromBufs", () => {
    test("fromBufs with 0 data", () => {
      const data: FixedBuf<32>[] = [];
      const root = MerkleNode.fromLeafHashes(data);
      expect(root.hash).toBe(null);
    });

    test("fromBufs with 1 data", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));

      const data = [data1];
      const root = MerkleNode.fromLeafHashes(data);
      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
      );
      expect(root.countNonNullLeaves()).toBe(1);
      expect(root.countAllLeaves()).toBe(1);
      expect(root.leftHeight()).toBe(1);
      expect(root.isNullBalanced()).toBe(true);
    });

    test("fromBufs with 2 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));

      const data = [data1, data2];
      const root = MerkleNode.fromLeafHashes(data);
      const hex = root.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
      );
      expect(root.countNonNullLeaves()).toBe(2);
      expect(root.countAllLeaves()).toBe(2);
      expect(root.leftHeight()).toBe(2);
      expect(root.isNullBalanced()).toBe(true);
    });

    test("fromBufs with 3 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data2, data3];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 3 datas (not null balanced)", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));

      const data = [data1, data2, data3];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 4 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));

      const data = [data1, data2, data3, data4];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 5 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));

      const data = [data1, data2, data3, data4, data5];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 6 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));

      const data = [data1, data2, data3, data4, data5, data6];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 7 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));

      const data = [data1, data2, data3, data4, data5, data6, data7];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 8 datas", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const data4 = Hash.doubleBlake3Hash(SysBuf.from("data4"));
      const data5 = Hash.doubleBlake3Hash(SysBuf.from("data5"));
      const data6 = Hash.doubleBlake3Hash(SysBuf.from("data6"));
      const data7 = Hash.doubleBlake3Hash(SysBuf.from("data7"));
      const data8 = Hash.doubleBlake3Hash(SysBuf.from("data8"));

      const data = [data1, data2, data3, data4, data5, data6, data7, data8];
      const root = MerkleNode.fromLeafHashes(data);

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

    test("fromBufs with 9 datas", () => {
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
      const root = MerkleNode.fromLeafHashes(data);

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
      const root = MerkleNode.fromLeafHashes(data);

      const node = root.doubleWithNulls();
      expect(node.countAllLeaves()).toBe(4);
    });
  });

  describe("updateBalancedLeafHash", () => {
    test("updateBalancedLeafHash with 0 data", () => {
      const data: FixedBuf<32>[] = [];
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes(data);
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
      const root = MerkleNode.fromLeafHashes([]);
      const updated = root.addLeafHash(data1);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244",
      );
      expect(updated.countNonNullLeaves()).toBe(1);
      expect(updated.countAllLeaves()).toBe(1);
      expect(updated.leftHeight()).toBe(1);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test("addLeafHash with 2 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const root = MerkleNode.fromLeafHashes([data1]);
      const updated = root.addLeafHash(data2);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde",
      );
      expect(updated.countNonNullLeaves()).toBe(2);
      expect(updated.countAllLeaves()).toBe(2);
      expect(updated.leftHeight()).toBe(2);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test("addLeafHash with 3 total", () => {
      const data1 = Hash.doubleBlake3Hash(SysBuf.from("data1"));
      const data2 = Hash.doubleBlake3Hash(SysBuf.from("data2"));
      const data3 = Hash.doubleBlake3Hash(SysBuf.from("data3"));
      const root = MerkleNode.fromLeafHashes([data1, data2]);
      const updated = root.addLeafHash(data3);
      const hex = updated.computeHash()?.buf.toString("hex");
      expect(hex).toBe(
        "a30fb8877ea729e759aa7f847d0232d6620721ab73a57aa4b31f26075c1901a3",
      );
      expect(updated.countNonNullLeaves()).toBe(3);
      expect(updated.countAllLeaves()).toBe(4);
      expect(updated.leftHeight()).toBe(3);
      expect(updated.isNullBalanced()).toBe(true);
    });

    test.skip("benchmark: addLeafHash with 1000 total", () => {
      console.time("addLeafHash with 1000 total");
      const datas = Array.from({ length: 1000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleNode.fromLeafHashes(datas);
      console.timeEnd("addLeafHash with 1000 total");
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

    test.skip("benchmark: addLeafHash with 10000 total", () => {
      console.time("addLeafHash with 10000 total");
      const datas = Array.from({ length: 10000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleNode.fromLeafHashes(datas);
      console.timeEnd("addLeafHash with 10000 total");
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

    test.skip("benchmark: addLeafHash with 100000 total", () => {
      console.time("addLeafHash with 100000 total");
      const datas = Array.from({ length: 100000 }, (_, i) =>
        Hash.doubleBlake3Hash(SysBuf.from(`data${i}`)),
      );
      const dataN = Hash.doubleBlake3Hash(SysBuf.from("dataN"));
      const root = MerkleNode.fromLeafHashes(datas);
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
});
