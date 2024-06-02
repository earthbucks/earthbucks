import * as Hash from "./hash.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { SysBuf, FixedIsoBuf } from "./iso-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res/src/lib.js";
import { U8, U16, U32, U64 } from "./numbers.js";

export class MerkleProof {
  public root: FixedIsoBuf<32>;
  public proof: Array<[FixedIsoBuf<32>, boolean]>;

  constructor(root: FixedIsoBuf<32>, proof: Array<[FixedIsoBuf<32>, boolean]>) {
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
    hashedDatas: FixedIsoBuf<32>[],
  ): Result<[FixedIsoBuf<32>, MerkleProof[]], string> {
    if (hashedDatas.length === 0) {
      return Err("Cannot create Merkle tree from empty array");
    }
    if (hashedDatas.length === 1) {
      const root = hashedDatas[0];
      const proof = new MerkleProof(root, []);
      return Ok([root, [proof]]);
    }
    if (hashedDatas.length === 2) {
      const root = Hash.doubleBlake3Hash(
        SysBuf.concat([hashedDatas[0], hashedDatas[1]]),
      );
      const proofs = [
        new MerkleProof(root, [[hashedDatas[1], true]]),
        new MerkleProof(root, [[hashedDatas[0], false]]),
      ];
      return Ok([root, proofs]);
    }
    // Make sure the number of elements is a power of two
    while ((hashedDatas.length & (hashedDatas.length - 1)) !== 0) {
      hashedDatas.push(hashedDatas[hashedDatas.length - 1]);
    }
    const [leftRoot, leftProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(0, hashedDatas.length / 2),
    ).unwrap();
    const [rightRoot, rightProofs] = MerkleProof.generateProofsAndRoot(
      hashedDatas.slice(hashedDatas.length / 2),
    ).unwrap();
    const root = Hash.doubleBlake3Hash(SysBuf.concat([leftRoot, rightRoot]));
    const proofs = [
      ...leftProofs.map(
        (proof) => new MerkleProof(root, [[rightRoot, true], ...proof.proof]),
      ),
      ...rightProofs.map(
        (proof) => new MerkleProof(root, [[leftRoot, false], ...proof.proof]),
      ),
    ];
    return Ok([root, proofs]);
  }

  toIsoBuf(): SysBuf {
    const bw = new IsoBufWriter();
    bw.write(this.root);
    bw.writeVarInt(new U64(this.proof.length));
    for (const [sibling, isLeft] of this.proof) {
      bw.write(sibling);
      bw.writeU8(new U8(isLeft ? 1 : 0));
    }
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: SysBuf): MerkleProof {
    const br = new IsoBufReader(buf);
    const root = br.readFixed(32).unwrap();
    const proof: Array<[FixedIsoBuf<32>, boolean]> = [];
    const proofLength = br.readVarInt().unwrap().n;
    for (let i = 0; i < proofLength; i++) {
      const sibling = br.readFixed(32).unwrap();
      const isLeft = br.readU8().unwrap().n === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  toIsoStr(): string {
    const u8vec = this.toIsoBuf();
    const hex = SysBuf.from(u8vec).toString("hex");
    return hex;
  }

  static fromIsoStr(hex: string): MerkleProof {
    const u8vec = SysBuf.from(hex, "hex");
    return MerkleProof.fromIsoBuf(u8vec);
  }
}
