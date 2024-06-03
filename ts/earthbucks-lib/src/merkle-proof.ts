import * as Hash from "./hash.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { SysBuf, FixedBuf } from "./ebx-buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { GenericError } from "./ebx-error.js";

export class MerkleProof {
  public root: FixedBuf<32>;
  public proof: Array<[FixedBuf<32>, boolean]>;

  constructor(root: FixedBuf<32>, proof: Array<[FixedBuf<32>, boolean]>) {
    this.root = root;
    this.proof = proof;
  }

  public verify(hashedData: SysBuf): boolean {
    let hash = hashedData;
    for (const [sibling, isLeft] of this.proof) {
      hash = isLeft
        ? Hash.doubleBlake3Hash(SysBuf.concat([sibling, hash]))
        : Hash.doubleBlake3Hash(SysBuf.concat([hash, sibling]));
    }
    return SysBuf.compare(hash, this.root) === 0;
  }

  static verifyProof(data: SysBuf, proof: MerkleProof, root: SysBuf) {
    return SysBuf.compare(proof.root, root) === 0 || proof.verify(data);
  }

  static generateProofsAndRoot(
    hashedDatas: FixedBuf<32>[],
  ): [FixedBuf<32>, MerkleProof[]] {
    if (hashedDatas.length === 0) {
      throw new GenericError("Cannot create Merkle tree from empty array");
    }
    if (hashedDatas.length === 1) {
      const root = hashedDatas[0];
      const proof = new MerkleProof(root, []);
      return [root, [proof]];
    }
    if (hashedDatas.length === 2) {
      const root = Hash.doubleBlake3Hash(
        SysBuf.concat([hashedDatas[0], hashedDatas[1]]),
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
    const root = Hash.doubleBlake3Hash(SysBuf.concat([leftRoot, rightRoot]));
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

  toBuf(): SysBuf {
    const bw = new BufWriter();
    bw.write(this.root);
    bw.writeVarInt(new U64(this.proof.length));
    for (const [sibling, isLeft] of this.proof) {
      bw.write(sibling);
      bw.writeU8(new U8(isLeft ? 1 : 0));
    }
    return bw.toBuf();
  }

  static fromBuf(buf: SysBuf): MerkleProof {
    const br = new BufReader(buf);
    const root = br.readFixed(32);
    const proof: Array<[FixedBuf<32>, boolean]> = [];
    const proofLength = br.readVarInt().n;
    for (let i = 0; i < proofLength; i++) {
      const sibling = br.readFixed(32);
      const isLeft = br.readU8().n === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  toIsoStr(): string {
    const u8vec = this.toBuf();
    const hex = SysBuf.from(u8vec).toString("hex");
    return hex;
  }

  static fromIsoStr(hex: string): MerkleProof {
    const u8vec = SysBuf.from(hex, "hex");
    return MerkleProof.fromBuf(u8vec);
  }
}
