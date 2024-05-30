import { MerkleProof } from "./merkle-proof.js";
import { Tx } from "./tx.js";
import { EbxBuffer } from "./ebx-buffer";

export class MerkleTxs {
  public txs: Tx[];
  public root: EbxBuffer;
  public proofs: MerkleProof[];

  constructor(txs: Tx[]) {
    if (txs.length === 0) {
      throw Error("Cannot create Merkle tree from empty array");
    }
    this.txs = txs;
    const hashedDatas = txs.map((tx) => tx.id());
    const [root, proofs] =
      MerkleProof.generateProofsAndRoot(hashedDatas).unwrap();
    this.root = root;
    this.proofs = proofs;
  }

  public verify(): boolean {
    for (let i = 0; i < this.txs.length; i++) {
      const tx = this.txs[i];
      const proof = this.proofs[i];
      if (!MerkleProof.verifyProof(tx.id(), proof, this.root)) {
        return false;
      }
    }
    return true;
  }
}
