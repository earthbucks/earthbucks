import { Hash } from "./hash.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { SysBuf } from "./buf.js";
import type { FixedBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { GenericError } from "./error.js";

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
        ? Hash.doubleBlake3Hash(SysBuf.concat([sibling.buf, hash])).buf
        : Hash.doubleBlake3Hash(SysBuf.concat([hash, sibling.buf])).buf;
    }
    return SysBuf.compare(hash, this.root.buf) === 0;
  }

  static verifyProof(data: SysBuf, proof: MerkleProof, root: SysBuf): boolean {
    return SysBuf.compare(proof.root.buf, root) === 0 || proof.verify(data);
  }

  static concat(left: FixedBuf<32> | null, right: FixedBuf<32> | null) {
    const leftBuf = left ? left.buf : SysBuf.alloc(0);
    const rightBuf = right ? right.buf : SysBuf.alloc(0);
    return SysBuf.concat([leftBuf, rightBuf]);
  }

  static generateProofsAndRoot(
    hashes: (FixedBuf<32> | null)[],
  ): [FixedBuf<32>, MerkleProof[]] {
    if (hashes.length === 0) {
      throw new GenericError("Cannot create Merkle tree from empty array");
    }
    if (hashes.length === 1) {
      const root = hashes[0] as FixedBuf<32>;
      const proof = new MerkleProof(root, []);
      return [root, [proof]];
    }
    if (hashes.length === 2) {
      const hashedDatas0 = hashes[0] as FixedBuf<32>;
      const hashedDatas1 = hashes[1] as FixedBuf<32>;
      const root = Hash.doubleBlake3Hash(
        MerkleProof.concat(hashedDatas0 ?? null, hashedDatas1 ?? null),
      );
      const proofs = [
        new MerkleProof(root, [[hashedDatas1, true]]),
        new MerkleProof(root, [[hashedDatas0, false]]),
      ];
      return [root, proofs];
    }
    const newHashes: (FixedBuf<32> | null)[] = hashes.slice();
    // Make sure the number of elements is a power of two
    while ((newHashes.length & (newHashes.length - 1)) !== 0) {
      newHashes.push(null);
    }
    const [leftRoot, leftProofs] = MerkleProof.generateProofsAndRoot(
      newHashes.slice(0, newHashes.length / 2),
    );
    const [rightRoot, rightProofs] = MerkleProof.generateProofsAndRoot(
      newHashes.slice(newHashes.length / 2),
    );
    const root = Hash.doubleBlake3Hash(
      SysBuf.concat([leftRoot.buf, rightRoot.buf]),
    );
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
    bw.write(this.root.buf);
    bw.writeVarInt(new U64(this.proof.length));
    for (const [sibling, isLeft] of this.proof) {
      bw.write(sibling.buf);
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

  toString(): string {
    const buf = this.toBuf();
    const hex = SysBuf.from(buf).toString("hex");
    return hex;
  }

  static fromString(hex: string): MerkleProof {
    const buf = SysBuf.from(hex, "hex");
    return MerkleProof.fromBuf(buf);
  }
}
