import { GenericError } from "./error.js";
import * as Hash from "./hash.js";
import { SysBuf, FixedBuf } from "./buf.js";

export class MerkleNode {
  public left: MerkleNode | null;
  public right: MerkleNode | null;
  public hashedData: FixedBuf<32>;

  constructor(
    left: MerkleNode | null,
    right: MerkleNode | null,
    hashedData: FixedBuf<32>,
  ) {
    this.left = left;
    this.right = right;
    this.hashedData = hashedData;
  }

  public hash(): FixedBuf<32> {
    if (this.left || this.right) {
      const leftData = this.left ? this.left.hash().buf : SysBuf.alloc(0);
      const rightData = this.right ? this.right.hash().buf : leftData;
      return Hash.doubleBlake3Hash(SysBuf.concat([leftData, rightData]));
    } else {
      return this.hashedData;
    }
  }

  static fromBufs(hashedDatas: FixedBuf<32>[]): MerkleNode {
    if (hashedDatas.length === 0) {
      throw new GenericError("Cannot create MerkleNode from empty array");
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
        Hash.doubleBlake3Hash(
          SysBuf.concat([left.hash().buf, right.hash().buf]),
        ),
      );
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1]);
    }
    const left = MerkleNode.fromBufs(
      hashedDatas.slice(0, hashedDatas.length / 2),
    );
    const right = MerkleNode.fromBufs(
      hashedDatas.slice(hashedDatas.length / 2),
    );

    return new MerkleNode(
      left,
      right,
      Hash.doubleBlake3Hash(SysBuf.concat([left.hash().buf, right.hash().buf])),
    );
  }
}
