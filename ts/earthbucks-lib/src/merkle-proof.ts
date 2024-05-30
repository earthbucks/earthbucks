import * as Hash from "./hash.js";
import { IsoBufWriter } from "./iso-buf-writer.js";
import { IsoBufReader } from "./iso-buf-reader.js";
import { EbxBuf } from "./ebx-buf.js";
import { Result, Ok, Err } from "earthbucks-opt-res";

export class MerkleProof {
  public root: EbxBuf;
  public proof: Array<[EbxBuf, boolean]>;

  constructor(root: EbxBuf, proof: Array<[EbxBuf, boolean]>) {
    this.root = root;
    this.proof = proof;
  }

  public verify(hashedData: EbxBuf): boolean {
    let hash = hashedData;
    for (const [sibling, isLeft] of this.proof) {
      hash = isLeft
        ? Hash.doubleBlake3Hash(EbxBuf.concat([sibling, hash]))
        : Hash.doubleBlake3Hash(EbxBuf.concat([hash, sibling]));
    }
    return EbxBuf.compare(hash, this.root) === 0;
  }

  static verifyProof(data: EbxBuf, proof: MerkleProof, root: EbxBuf) {
    return EbxBuf.compare(proof.root, root) === 0 || proof.verify(data);
  }

  static generateProofsAndRoot(
    hashedDatas: EbxBuf[],
  ): Result<[EbxBuf, MerkleProof[]], string> {
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
        EbxBuf.concat([hashedDatas[0], hashedDatas[1]]),
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
    const root = Hash.doubleBlake3Hash(EbxBuf.concat([leftRoot, rightRoot]));
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

  toIsoBuf() {
    const bw = new IsoBufWriter();
    bw.writeIsoBuf(this.root);
    bw.writeVarIntNum(this.proof.length);
    for (const [sibling, isLeft] of this.proof) {
      bw.writeIsoBuf(sibling);
      bw.writeUInt8(isLeft ? 1 : 0);
    }
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: EbxBuf): MerkleProof {
    const br = new IsoBufReader(buf);
    const root = br.read(32).unwrap();
    const proof: Array<[EbxBuf, boolean]> = [];
    const proofLength = br.readVarIntNum().unwrap();
    for (let i = 0; i < proofLength; i++) {
      const sibling = br.read(32).unwrap();
      const isLeft = br.readU8().unwrap() === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  toIsoStr(): string {
    const u8vec = this.toIsoBuf();
    const hex = EbxBuf.from(u8vec).toString("hex");
    return hex;
  }

  static fromIsoStr(hex: string): MerkleProof {
    const u8vec = EbxBuf.from(hex, "hex");
    return MerkleProof.fromIsoBuf(u8vec);
  }
}
