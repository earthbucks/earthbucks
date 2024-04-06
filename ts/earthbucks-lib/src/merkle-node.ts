import { doubleBlake3Hash } from './blake3'

export class MerkleProof {
  public root: Uint8Array
  public proof: Array<[Uint8Array, boolean]>

  constructor(root: Uint8Array, proof: Array<[Uint8Array, boolean]>) {
    this.root = root
    this.proof = proof
  }

  public verify(hashedData: Uint8Array): boolean {
    let hash = hashedData
    for (const [sibling, isLeft] of this.proof) {
      hash = isLeft
        ? doubleBlake3Hash(Buffer.concat([sibling, hash]))
        : doubleBlake3Hash(Buffer.concat([hash, sibling]))
    }
    return Buffer.compare(hash, this.root) === 0
  }

  static verifyProof(data: Uint8Array, proof: MerkleProof, root: Uint8Array) {
    return Buffer.compare(proof.root, root) === 0 || proof.verify(data)
  }

  static generateProofsAndRoot(
    hashedDatas: Uint8Array[],
  ): [Uint8Array, MerkleProof[]] {
    if (hashedDatas.length === 0) {
      throw new Error('Cannot create Merkle tree from empty array')
    }
    if (hashedDatas.length === 1) {
      const root = hashedDatas[0]
      const proof = new MerkleProof(root, [])
      return [root, [proof]]
    }
    if (hashedDatas.length === 2) {
      const root = doubleBlake3Hash(
        Buffer.concat([hashedDatas[0], hashedDatas[1]]),
      )
      const proofs = [
        new MerkleProof(root, [[hashedDatas[1], true]]),
        new MerkleProof(root, [[hashedDatas[0], false]]),
      ]
      return [root, proofs]
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1])
    }
    const [leftRoot, leftProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(0, hashedDatas.length / 2),
    )
    const [rightRoot, rightProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(hashedDatas.length / 2),
    )
    const root = doubleBlake3Hash(Buffer.concat([leftRoot, rightRoot]))
    const proofs = [
      ...leftProofs.map(
        (proof) => new MerkleProof(root, [[rightRoot, true], ...proof.proof]),
      ),
      ...rightProofs.map(
        (proof) => new MerkleProof(root, [[leftRoot, false], ...proof.proof]),
      ),
    ]
    return [root, proofs]
  }
}

export default class MerkleNode {
  public left: MerkleNode | null
  public right: MerkleNode | null
  public hashedData: Uint8Array

  constructor(
    left: MerkleNode | null,
    right: MerkleNode | null,
    hashedData: Uint8Array,
  ) {
    this.left = left
    this.right = right
    this.hashedData = hashedData
  }

  public hash(): Uint8Array {
    if (this.left || this.right) {
      const leftData = this.left ? this.left.hash() : new Uint8Array()
      const rightData = this.right ? this.right.hash() : leftData
      return doubleBlake3Hash(Buffer.concat([leftData, rightData]))
    } else {
      return this.hashedData
    }
  }

  static fromU8Vecs(hashedDatas: Uint8Array[]): MerkleNode {
    if (hashedDatas.length === 0) {
      throw new Error('Cannot create MerkleNode from empty array')
    }
    if (hashedDatas.length === 1) {
      return new MerkleNode(null, null, hashedDatas[0])
    }
    if (hashedDatas.length === 2) {
      const left = new MerkleNode(null, null, hashedDatas[0])
      const right = new MerkleNode(null, null, hashedDatas[1])
      return new MerkleNode(
        left,
        right,
        doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
      )
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1])
    }
    const left = MerkleNode.fromU8Vecs(
      hashedDatas.slice(0, hashedDatas.length / 2),
    )
    const right = MerkleNode.fromU8Vecs(
      hashedDatas.slice(hashedDatas.length / 2),
    )

    return new MerkleNode(
      left,
      right,
      doubleBlake3Hash(Buffer.concat([left.hash(), right.hash()])),
    )
  }
}
