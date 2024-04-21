import { doubleBlake3Hash } from "./blake3";
import { Buffer } from "buffer";

export default class MerkleNode {
  public left: MerkleNode | null;
  public right: MerkleNode | null;
  public hashedData: Uint8Array;

  constructor(
    left: MerkleNode | null,
    right: MerkleNode | null,
    hashedData: Uint8Array,
  ) {
    this.left = left;
    this.right = right;
    this.hashedData = hashedData;
  }

  public hash(): Uint8Array {
    if (this.left || this.right) {
      const leftData = this.left ? this.left.hash() : new Uint8Array();
      const rightData = this.right ? this.right.hash() : leftData;
      return doubleBlake3Hash(Buffer.concat([leftData, rightData]));
    } else {
      return this.hashedData;
    }
  }

  static fromU8Vecs(hashedDatas: Uint8Array[]): MerkleNode {
    if (hashedDatas.length === 0) {
      throw new Error("Cannot create MerkleNode from empty array");
    }
    if (hashedDatas.length === 1) {
      return new MerkleNode(null, null, hashedDatas[0]);
    }
    if (hashedDatas.length === 2) {
      const left = new MerkleNode(null, null, hashedDatas[0]);
      const right = new MerkleNode(null, null, hashedDatas[1]);
      return new MerkleNode(
        left,
        right,
        doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
      );
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1]);
    }
    const left = MerkleNode.fromU8Vecs(
      hashedDatas.slice(0, hashedDatas.length / 2),
    );
    const right = MerkleNode.fromU8Vecs(
      hashedDatas.slice(hashedDatas.length / 2),
    );

    return new MerkleNode(
      left,
      right,
      doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
    );
  }
}
