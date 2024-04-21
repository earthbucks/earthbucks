import { doubleBlake3Hash } from "./blake3";
import BufferWriter from "./buffer-writer";
import BufferReader from "./buffer-reader";
import { Buffer } from "buffer";

export default class MerkleProof {
  public root: Uint8Array;
  public proof: Array<[Uint8Array, boolean]>;

  constructor(root: Uint8Array, proof: Array<[Uint8Array, boolean]>) {
    this.root = root;
    this.proof = proof;
  }

  public verify(hashedData: Uint8Array): boolean {
    let hash = hashedData;
    for (const [sibling, isLeft] of this.proof) {
      hash = isLeft
        ? doubleBlake3Hash(Buffer.concat([sibling, hash]))
        : doubleBlake3Hash(Buffer.concat([hash, sibling]));
    }
    return Buffer.compare(hash, this.root) === 0;
  }

  static verifyProof(data: Uint8Array, proof: MerkleProof, root: Uint8Array) {
    return Buffer.compare(proof.root, root) === 0 || proof.verify(data);
  }

  static generateProofsAndRoot(
    hashedDatas: Uint8Array[],
  ): [Uint8Array, MerkleProof[]] {
    if (hashedDatas.length === 0) {
      throw new Error("Cannot create Merkle tree from empty array");
    }
    if (hashedDatas.length === 1) {
      const root = hashedDatas[0];
      const proof = new MerkleProof(root, []);
      return [root, [proof]];
    }
    if (hashedDatas.length === 2) {
      const root = doubleBlake3Hash(
        Buffer.concat([hashedDatas[0], hashedDatas[1]]),
      );
      const proofs = [
        new MerkleProof(root, [[hashedDatas[1], true]]),
        new MerkleProof(root, [[hashedDatas[0], false]]),
      ];
      return [root, proofs];
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1]);
    }
    const [leftRoot, leftProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(0, hashedDatas.length / 2),
    );
    const [rightRoot, rightProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(hashedDatas.length / 2),
    );
    const root = doubleBlake3Hash(Buffer.concat([leftRoot, rightRoot]));
    const proofs = [
      ...leftProofs.map(
        (proof) => new MerkleProof(root, [[rightRoot, true], ...proof.proof]),
      ),
      ...rightProofs.map(
        (proof) => new MerkleProof(root, [[leftRoot, false], ...proof.proof]),
      ),
    ];
    return [root, proofs];
  }

  toU8Vec() {
    const bw = new BufferWriter();
    bw.writeU8Vec(this.root);
    bw.writeVarIntNum(this.proof.length);
    for (const [sibling, isLeft] of this.proof) {
      bw.writeU8Vec(sibling);
      bw.writeUInt8(isLeft ? 1 : 0);
    }
    return bw.toU8Vec();
  }

  static fromU8Vec(u8: Uint8Array): MerkleProof {
    const br = new BufferReader(u8);
    const root = br.readU8Vec(32);
    const proof: Array<[Uint8Array, boolean]> = [];
    const proofLength = br.readVarIntNum();
    for (let i = 0; i < proofLength; i++) {
      const sibling = br.readU8Vec(32);
      const isLeft = br.readUInt8() === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  toString(): string {
    const u8vec = this.toU8Vec();
    const hex = Buffer.from(u8vec).toString("hex");
    return hex;
  }

  static fromString(hex: string): MerkleProof {
    const u8vec = Buffer.from(hex, "hex");
    return MerkleProof.fromU8Vec(u8vec);
  }
}
