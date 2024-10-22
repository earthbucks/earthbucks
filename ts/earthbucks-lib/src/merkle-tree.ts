import { Hash } from "./hash.js";
import { WebBuf } from "./buf.js";
import { FixedBuf } from "./buf.js";
import { MerkleProof } from "./merkle-proof.js";

export class MerkleTree {
  public left: MerkleTree | null;
  public right: MerkleTree | null;
  public hash: FixedBuf<32> | null;

  constructor(
    left?: MerkleTree | null,
    right?: MerkleTree | null,
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

  static computeAllLeavesForBalancedTree(nonNullLeaves: number): number {
    if (nonNullLeaves === 0) {
      return 0;
    }
    // next greatest power of 2
    const count = 2 ** Math.ceil(Math.log2(nonNullLeaves));
    return count;
  }

  height(): number {
    return Math.floor(Math.log2(this.countAllLeaves())) + 1;
  }

  static concat(left: FixedBuf<32> | null, right: FixedBuf<32> | null) {
    const leftBuf = left ? left.buf : WebBuf.alloc(0);
    const rightBuf = right ? right.buf : WebBuf.alloc(0);
    return WebBuf.concat([leftBuf, rightBuf]);
  }

  public computeHash(): FixedBuf<32> | null {
    if (this.left || this.right) {
      const leftData = this.left?.computeHash() ?? null;
      const rightData = this.right?.computeHash() ?? null;
      return Hash.doubleBlake3Hash(MerkleTree.concat(leftData, rightData));
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

  static fromLeafHashes(hashes: (FixedBuf<32> | null)[]): MerkleTree {
    if (hashes.length === 0) {
      return new MerkleTree(null, null, null);
    }
    if (hashes.length === 1) {
      return new MerkleTree(null, null, hashes[0] as FixedBuf<32>);
    }
    if (hashes.length === 2) {
      const left = new MerkleTree(null, null, hashes[0] as FixedBuf<32>);
      const right = new MerkleTree(null, null, hashes[1] as FixedBuf<32>);
      return new MerkleTree(
        left,
        right,
        Hash.doubleBlake3Hash(
          MerkleTree.concat(left.computeHash(), right.computeHash()),
        ),
      );
    }
    // ensure balance by filling with nulls
    hashes = [...hashes];
    while ((hashes.length & (hashes.length - 1)) !== 0) {
      hashes.push(null);
    }

    const left = MerkleTree.fromLeafHashes(hashes.slice(0, hashes.length / 2));
    const right = MerkleTree.fromLeafHashes(hashes.slice(hashes.length / 2));

    return new MerkleTree(
      left,
      right,
      Hash.doubleBlake3Hash(
        MerkleTree.concat(left.computeHash(), right.computeHash()),
      ),
    );
  }

  doubleWithNulls(): MerkleTree {
    const count = this.countAllLeaves();
    if (Math.log2(count) % 1 !== 0) {
      throw new Error("Cannot double a tree that is not a power of 2");
    }
    const nullHashes = Array(count).fill(null);
    const nullTree = MerkleTree.fromLeafHashes(nullHashes);
    const newRoot = Hash.doubleBlake3Hash(
      MerkleTree.concat(this.hash, nullTree.hash),
    );
    return new MerkleTree(this, nullTree, newRoot);
  }

  updateBalancedLeafHash(pos: number, hash: FixedBuf<32>): MerkleTree {
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
      return new MerkleTree(null, null, hash);
    }
    if (countAll === 2) {
      if (pos === 0) {
        return new MerkleTree(
          new MerkleTree(null, null, hash),
          this.right,
          Hash.doubleBlake3Hash(
            MerkleTree.concat(hash, this.right?.hash ?? null),
          ),
        );
      }
      return new MerkleTree(
        this.left,
        new MerkleTree(null, null, hash),
        Hash.doubleBlake3Hash(MerkleTree.concat(this.left?.hash ?? null, hash)),
      );
    }
    const countLeft = countAll / 2;
    if (countLeft === null || countLeft === undefined) {
      throw new Error("Left node must not be null");
    }
    if (pos < countLeft) {
      const updatedLeft =
        this.left?.updateBalancedLeafHash(pos, hash) ?? this.left;
      return new MerkleTree(
        updatedLeft,
        this.right,
        Hash.doubleBlake3Hash(
          MerkleTree.concat(
            updatedLeft?.hash ?? null,
            this.right?.hash ?? null,
          ),
        ),
      );
    }
    const updatedRight =
      this.right?.updateBalancedLeafHash(pos - countLeft, hash) ?? this.right;
    return new MerkleTree(
      this.left,
      updatedRight,
      Hash.doubleBlake3Hash(
        MerkleTree.concat(this.left?.hash ?? null, updatedRight?.hash ?? null),
      ),
    );
  }

  /**
   * Add a leaf hash to the tree. Assumes tree is balanced with nulls.
   *
   * @param hash The leaf hash to add.
   * @param nonNullLeaves The number of non-null leaves in the tree. This is
   * typically the number of transactions in the tree.
   * @returns The new Merkle tree with the leaf hash added.
   */
  addLeafHash(hash: FixedBuf<32>, nonNullLeaves?: number): MerkleTree {
    const countNonNull = nonNullLeaves ?? this.countNonNullLeaves();
    const countAll = MerkleTree.computeAllLeavesForBalancedTree(countNonNull);
    if (countNonNull === countAll && countAll > 0) {
      return this.doubleWithNulls().updateBalancedLeafHash(countNonNull, hash);
    }
    return this.updateBalancedLeafHash(countNonNull, hash);
  }

  updateBalancedLeafHashes(
    startPos: number,
    hashes: FixedBuf<32>[],
  ): MerkleTree {
    let tree: MerkleTree = this;
    for (let i = 0; i < hashes.length; i++) {
      tree = tree.updateBalancedLeafHash(
        startPos + i,
        hashes[i] as FixedBuf<32>,
      );
    }
    return tree;
  }

  /**
   * Add leaf hashes to the tree. Assumes tree is balanced with nulls.
   *
   * @param hashes The leaf hashes to add.
   * @param nonNullLeaves The number of non-null leaves in the tree. This is
   * typically the number of transactions in the tree.
   * @returns The new Merkle tree with the leaf hashes added.
   */
  addLeafHashes(hashes: FixedBuf<32>[], nonNullLeaves?: number): MerkleTree {
    let tree: MerkleTree = this;
    for (let i = 0; i < hashes.length; i++) {
      if (nonNullLeaves !== undefined) {
        tree = tree.addLeafHash(hashes[i] as FixedBuf<32>, nonNullLeaves + i);
      } else {
        tree = tree.addLeafHash(hashes[i] as FixedBuf<32>);
      }
    }
    return tree;
  }

  getMerkleProof(pos: number) {
    return new MerkleProof(this.hash, this.getProof(pos));
  }

  getProof(pos: number): Array<[FixedBuf<32> | null, boolean]> {
    if (pos < 0) {
      throw new Error("Position must be greater than or equal to 0");
    }
    const countAll = this.countAllLeaves();
    if (pos >= countAll) {
      throw new Error("Position must be less than the number of leaves");
    }
    if (countAll === 1) {
      return [];
    }
    if (countAll === 2) {
      return pos === 0
        ? [[this.right?.hash ?? null, true]]
        : [[this.left?.hash ?? null, false]];
    }
    const countLeft = Math.ceil(countAll / 2); // Ensure countLeft is an integer
    if (pos < countLeft) {
      return [
        ...(this.left?.getProof(pos) ?? []),
        [this.right?.hash ?? null, true],
      ];
    }
    return [
      ...(this.right?.getProof(pos - countLeft) ?? []),
      [this.left?.hash ?? null, false],
    ];
  }

  static verifyProof(
    merkleRoot: FixedBuf<32> | null,
    proof: Array<[FixedBuf<32> | null, boolean]>,
    hash: FixedBuf<32>,
  ): boolean {
    if (!merkleRoot) {
      return false;
    }
    hash = proof.reduce((acc, [sibling, isLeft]) => {
      if (isLeft) {
        return Hash.doubleBlake3Hash(MerkleTree.concat(acc, sibling));
      }
      return Hash.doubleBlake3Hash(MerkleTree.concat(sibling, acc));
    }, hash);
    return WebBuf.compare(hash.buf, merkleRoot.buf) === 0;
  }
}
