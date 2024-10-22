import { Hash } from "./hash.js";
import { BufWriter } from "./buf-writer.js";
import { BufReader } from "./buf-reader.js";
import { WebBuf } from "./buf.js";
import { FixedBuf } from "./buf.js";
import { U8, U16, U32, U64 } from "./numbers.js";
import { MerkleTree } from "./merkle-tree.js";

export class MerkleProof {
  public root: FixedBuf<32> | null;
  public proof: Array<[FixedBuf<32> | null, boolean]>;

  constructor(
    root: FixedBuf<32> | null,
    proof: Array<[FixedBuf<32> | null, boolean]>,
  ) {
    this.root = root;
    this.proof = proof;
  }

  toBuf(): WebBuf {
    const bw = new BufWriter();
    bw.write(this.root?.buf ?? WebBuf.alloc(32));
    bw.writeVarInt(new U64(this.proof.length));
    for (const [sibling, isLeft] of this.proof) {
      bw.write(sibling?.buf ?? WebBuf.alloc(32));
      bw.writeU8(new U8(isLeft ? 1 : 0));
    }
    return bw.toBuf();
  }

  toHex(): string {
    return this.toBuf().toString("hex");
  }

  static fromBuf(buf: WebBuf): MerkleProof {
    const br = new BufReader(buf);
    const root = br.readFixed(32);
    const proof: Array<[FixedBuf<32> | null, boolean]> = [];
    const proofLength = br.readVarInt().n;
    for (let i = 0; i < proofLength; i++) {
      let sibling: FixedBuf<32> | null = br.readFixed(32);
      if (WebBuf.compare(sibling.buf, WebBuf.alloc(32)) === 0) {
        sibling = null;
      }
      const isLeft = br.readU8().n === 1;
      proof.push([sibling, isLeft]);
    }
    return new MerkleProof(root, proof);
  }

  static fromHex(hex: string): MerkleProof {
    const buf = WebBuf.from(hex, "hex");
    return MerkleProof.fromBuf(buf);
  }

  toString(): string {
    const buf = this.toBuf();
    const hex = WebBuf.from(buf).toString("hex");
    return hex;
  }

  static fromString(hex: string): MerkleProof {
    const buf = WebBuf.from(hex, "hex");
    return MerkleProof.fromBuf(buf);
  }

  static fromMerkleTree(merkleNode: MerkleTree, pos: number) {
    const proof: Array<[FixedBuf<32> | null, boolean]> =
      merkleNode.getProof(pos);
    return new MerkleProof(merkleNode.hash, proof);
  }

  verify(hash: FixedBuf<32>): boolean {
    return MerkleTree.verifyProof(this.root, this.proof, hash);
  }
}
