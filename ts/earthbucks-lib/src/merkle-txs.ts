import MerkleProof from "./merkle-proof";
import Tx from "./tx";
import { Buffer } from "buffer";

export default class MerkleTxs {
  public txs: Tx[];
  public root: Uint8Array;
  public proofs: MerkleProof[];

  constructor(txs: Tx[]) {
    this.txs = txs;
    const hashedDatas = txs.map((tx) => tx.id());
    const [root, proofs] = MerkleProof.generateProofsAndRoot(hashedDatas);
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
