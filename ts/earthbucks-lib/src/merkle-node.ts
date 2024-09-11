import { Hash } from "./hash.js";
import { SysBuf } from "./buf.js";
import { FixedBuf } from "./buf.js";

export class MerkleNode {
  public left: MerkleNode | null;
  public right: MerkleNode | null;
  public hash: FixedBuf<32> | null;

  constructor(
    left?: MerkleNode | null,
    right?: MerkleNode | null,
    hash?: FixedBuf<32> | null,
  ) {
    this.left = left ?? null;
    this.right = right ?? null;
    this.hash = hash ?? null;
  }

  countNonNullLeaves(): number {
    if (this.left || this.right) {
      return (
        (this.left ? this.left.countNonNullLeaves() : 0) +
        (this.right ? this.right.countNonNullLeaves() : 0)
      );
    }
    return this.hash ? 1 : 0;
  }

  countAllLeaves(): number {
    if (this.left || this.right) {
      return (
        (this.left ? this.left.countAllLeaves() : 0) +
        (this.right ? this.right.countAllLeaves() : 0)
      );
    }
    return 1;
  }

  static concat(left: FixedBuf<32> | null, right: FixedBuf<32> | null) {
    const leftBuf = left ? left.buf : SysBuf.alloc(0);
    const rightBuf = right ? right.buf : SysBuf.alloc(0);
    return SysBuf.concat([leftBuf, rightBuf]);
  }

  public computeHash(): FixedBuf<32> | null {
    if (this.left || this.right) {
      const leftData = this.left?.computeHash() ?? null;
      const rightData = this.right?.computeHash() ?? null;
      return Hash.doubleBlake3Hash(MerkleNode.concat(leftData, rightData));
    }
    return this.hash;
  }

  public computeMerkleRootId(): FixedBuf<32> {
    return this.computeHash() ?? FixedBuf.alloc(32);
  }

  leftHeight(): number {
    return this.left ? this.left.leftHeight() + 1 : this.hash ? 1 : 0;
  }

  rightHeight(): number {
    return this.right ? this.right.rightHeight() + 1 : this.hash ? 1 : 0;
  }

  isNullBalanced(): boolean {
    if (!this.left && !this.right) {
      return true;
    }
    if (!this.left || !this.right) {
      return false;
    }
    return (
      this.left.isNullBalanced() &&
      this.right.isNullBalanced() &&
      Math.abs(this.left.leftHeight() - this.right.leftHeight()) <= 1 &&
      Math.abs(this.left.rightHeight() - this.right.rightHeight()) <= 1
    );
  }

  static fromLeafHashes(hashes: (FixedBuf<32> | null)[]): MerkleNode {
    if (hashes.length === 0) {
      return new MerkleNode(null, null, null);
    }
    if (hashes.length === 1) {
      return new MerkleNode(null, null, hashes[0] as FixedBuf<32>);
    }
    if (hashes.length === 2) {
      const left = new MerkleNode(null, null, hashes[0] as FixedBuf<32>);
      const right = new MerkleNode(null, null, hashes[1] as FixedBuf<32>);
      return new MerkleNode(
        left,
        right,
        Hash.doubleBlake3Hash(
          MerkleNode.concat(left.computeHash(), right.computeHash()),
        ),
      );
    }
    // ensure balance by filling with nulls
    while ((hashes.length & (hashes.length - 1)) !== 0) {
      hashes.push(null);
    }

    const left = MerkleNode.fromLeafHashes(hashes.slice(0, hashes.length / 2));
    const right = MerkleNode.fromLeafHashes(hashes.slice(hashes.length / 2));

    return new MerkleNode(
      left,
      right,
      Hash.doubleBlake3Hash(
        MerkleNode.concat(left.computeHash(), right.computeHash()),
      ),
    );
  }

  doubleWithNulls(): MerkleNode {
    const count = this.countAllLeaves();
    if (Math.log2(count) % 1 !== 0) {
      throw new Error("Cannot double a tree that is not a power of 2");
    }
    const nullHashes = Array(count).fill(null);
    const nullTree = MerkleNode.fromLeafHashes(nullHashes);
    return new MerkleNode(this, nullTree, null);
  }

  updateBalancedLeafHash(pos: number, hash: FixedBuf<32>): MerkleNode {
    if (pos < 0) {
      throw new Error("Position must be greater than or equal to 0");
    }
    const countAll = this.countAllLeaves();
    if (pos >= countAll) {
      throw new Error("Position must be less than the number of leaves");
    }
    if (Math.log2(countAll) % 1 !== 0) {
      throw new Error("Cannot update a tree that is not a power of 2");
    }
    if (countAll === 1) {
      return new MerkleNode(null, null, hash);
    }
    if (countAll === 2) {
      if (pos === 0) {
        return new MerkleNode(
          new MerkleNode(null, null, hash),
          this.right,
          Hash.doubleBlake3Hash(
            MerkleNode.concat(hash, this.right?.hash ?? null),
          ),
        );
      }
      return new MerkleNode(
        this.left,
        new MerkleNode(null, null, hash),
        Hash.doubleBlake3Hash(MerkleNode.concat(this.left?.hash ?? null, hash)),
      );
    }
    const countLeft = countAll / 2;
    if (countLeft === null || countLeft === undefined) {
      throw new Error("Left node must not be null");
    }
    if (pos < countLeft) {
      return new MerkleNode(
        this.left?.updateBalancedLeafHash(pos, hash) ?? this.left,
        this.right,
        Hash.doubleBlake3Hash(
          MerkleNode.concat(this.left?.hash ?? null, this.right?.hash ?? null),
        ),
      );
    }
    return new MerkleNode(
      this.left,
      this.right?.updateBalancedLeafHash(pos - countLeft, hash) ?? this.right,
      Hash.doubleBlake3Hash(
        MerkleNode.concat(this.left?.hash ?? null, this.right?.hash ?? null),
      ),
    );
  }

  addLeafHash(hash: FixedBuf<32>): MerkleNode {
    const countNonNull = this.countNonNullLeaves();
    const countAll = this.countAllLeaves();
    if (countNonNull === countAll) {
      return this.doubleWithNulls().updateBalancedLeafHash(countNonNull, hash);
    }
    return this.updateBalancedLeafHash(countNonNull, hash);
  }

  // TODO: make this more efficient by computing all new hashes at once
  updateBalancedLeafHashes(
    startPos: number,
    hashes: FixedBuf<32>[],
  ): MerkleNode {
    let tree: MerkleNode = this;
    for (let i = 0; i < hashes.length; i++) {
      tree = tree.updateBalancedLeafHash(
        startPos + i,
        hashes[i] as FixedBuf<32>,
      );
    }
    return tree;
  }

  // TODO: make this more efficient by computing all new hashes at once
  addLeafHashes(hashes: FixedBuf<32>[]): MerkleNode {
    let tree: MerkleNode = this;
    for (let i = 0; i < hashes.length; i++) {
      tree = tree.addLeafHash(hashes[i] as FixedBuf<32>);
    }
    return tree;
  }
}
