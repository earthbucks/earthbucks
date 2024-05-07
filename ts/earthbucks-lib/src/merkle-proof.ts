import { doubleBlake3Hash } from "./blake3";
import IsoBufWriter from "./iso-buf-writer";
import IsoBufReader from "./iso-buf-reader";
import { Buffer } from "buffer";
import { Result, Ok, Err } from "ts-results";

export default class MerkleProof {
  public root: Buffer;
  public proof: Array<[Buffer, boolean]>;

  constructor(root: Buffer, proof: Array<[Buffer, boolean]>) {
    this.root = root;
    this.proof = proof;
  }

  public verify(hashedData: Buffer): boolean {
    let hash = hashedData;
    for (const [sibling, isLeft] of this.proof) {
      hash = isLeft
        ? doubleBlake3Hash(Buffer.concat([sibling, hash]))
        : doubleBlake3Hash(Buffer.concat([hash, sibling]));
    }
    return Buffer.compare(hash, this.root) === 0;
  }

  static verifyProof(data: Buffer, proof: MerkleProof, root: Buffer) {
    return Buffer.compare(proof.root, root) === 0 || proof.verify(data);
  }

  static generateProofsAndRoot(
    hashedDatas: Buffer[],
  ): Result<[Buffer, MerkleProof[]], string> {
    if (hashedDatas.length === 0) {
      return Err("Cannot create Merkle tree from empty array");
    }
    if (hashedDatas.length === 1) {
      const root = hashedDatas[0];
      const proof = new MerkleProof(root, []);
      return Ok([root, [proof]]);
    }
    if (hashedDatas.length === 2) {
      const root = doubleBlake3Hash(
        Buffer.concat([hashedDatas[0], hashedDatas[1]]),
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
    const root = doubleBlake3Hash(Buffer.concat([leftRoot, rightRoot]));
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
    bw.writeBuffer(this.root);
    bw.writeVarIntNum(this.proof.length);
    for (const [sibling, isLeft] of this.proof) {
      bw.writeBuffer(sibling);
      bw.writeUInt8(isLeft ? 1 : 0);
    }
    return bw.toIsoBuf();
  }

  static fromIsoBuf(buf: Buffer): MerkleProof {
    const br = new IsoBufReader(buf);
    const root = br.readBuffer(32).unwrap();
    const proof: Array<[Buffer, boolean]> = [];
    const proofLength = br.readVarIntNum().unwrap();
    for (let i = 0; i < proofLength; i++) {
      const sibling = br.readBuffer(32).unwrap();
      const isLeft = br.readUInt8().unwrap() === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  toIsoStr(): string {
    const u8vec = this.toIsoBuf();
    const hex = Buffer.from(u8vec).toString("hex");
    return hex;
  }

  static fromIsoStr(hex: string): MerkleProof {
    const u8vec = Buffer.from(hex, "hex");
    return MerkleProof.fromIsoBuf(u8vec);
  }
}
