import { doubleBlake3Hash } from './blake3'

export default class MerkleNode {
  public left: MerkleNode | null
  public right: MerkleNode | null
  public data: Uint8Array

  constructor(
    left: MerkleNode | null,
    right: MerkleNode | null,
    data: Uint8Array,
  ) {
    this.left = left
    this.right = right
    this.data = data
  }

  public hash(): Uint8Array {
    if (this.left || this.right) {
      const leftData = this.left ? this.left.hash() : new Uint8Array()
      const rightData = this.right ? this.right.hash() : leftData
      return doubleBlake3Hash(Buffer.concat([leftData, rightData]))
    } else {
      return this.data
    }
  }

  static fromU8Vecs(datas: Uint8Array[]): MerkleNode {
    if (datas.length === 0) {
      throw new Error('Cannot create MerkleNode from empty array')
    }
    if (datas.length === 1) {
      return new MerkleNode(null, null, datas[0])
    }
    if (datas.length === 2) {
      const left = new MerkleNode(null, null, datas[0])
      const right = new MerkleNode(null, null, datas[1])
      return new MerkleNode(
        left,
        right,
        doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
      )
    }
    // Make sure the number of elements is a power of two
    while ((datas.length & (datas.length - 1)) !== 0) {
      datas.push(datas[datas.length - 1])
    }
    const left = MerkleNode.fromU8Vecs(datas.slice(0, datas.length / 2))
    const right = MerkleNode.fromU8Vecs(datas.slice(datas.length / 2))
    return new MerkleNode(
      left,
      right,
      doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
    )
  }

  // This method generates an inclusion proof for the given data.
  public generateProof(data: Uint8Array): Uint8Array[] | null {
    // if (this.data.equals(data)) {
    if (Buffer.compare(this.data, data) === 0) {
      return []
    } else if (this.left && this.right) {
      const leftProof = this.left.generateProof(data)
      if (leftProof) {
        return [this.right.data, ...leftProof]
      }
      const rightProof = this.right.generateProof(data)
      if (rightProof) {
        return [this.left.data, ...rightProof]
      }
    }
    return null
  }

  // This method verifies an inclusion proof for the given data and root.
  public static verifyProof(
    data: Uint8Array,
    proof: Uint8Array[],
    root: Uint8Array,
  ): boolean {
    let hash = data
    for (const sibling of proof) {
      hash = doubleBlake3Hash(Buffer.concat([hash, sibling]))
    }
    // return hash.equals(root)
    return Buffer.compare(hash, root) === 0
  }
}
