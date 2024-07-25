import { MerkleProof } from "./merkle-proof.js";
import type { Tx } from "./tx.js";
import { FixedBuf } from "./buf.js";

interface MerkleTxsInterface {
  txs: Tx[];
  root: FixedBuf<32>;
  proofs: MerkleProof[];
}

export class MerkleTxs implements MerkleTxsInterface {
  public txs: Tx[];
  public root: FixedBuf<32>;
  public proofs: MerkleProof[];

  constructor({
    txs = [],
    root = FixedBuf.alloc(32),
    proofs = [],
  }: Partial<MerkleTxsInterface> = {}) {
    this.txs = txs;
    this.root = root;
    this.proofs = proofs;
  }

  static fromTxs(txs: Tx[] = []): MerkleTxs {
    const merkleTxs = new MerkleTxs();
    if (txs.length === 0) {
      merkleTxs.txs = [];
      merkleTxs.root = FixedBuf.alloc(32);
      merkleTxs.proofs = [];
      return merkleTxs;
    }
    merkleTxs.txs = txs;
    const hashedDatas = txs.map((tx) => tx.id());
    const [root, proofs] = MerkleProof.generateProofsAndRoot(hashedDatas);
    merkleTxs.root = root;
    merkleTxs.proofs = proofs;
    return merkleTxs;
  }

  public verify(): boolean {
    if (this.txs.length > this.proofs.length) {
      return false;
    }
    for (let i = 0; i < this.txs.length; i++) {
      const tx = this.txs[i] as Tx;
      const proof = this.proofs[i] as MerkleProof;
      if (!MerkleProof.verifyProof(tx.id().buf, proof, this.root.buf)) {
        return false;
      }
    }
    return true;
  }

  public add(tx: Tx): MerkleTxs {
    const txs = this.txs.concat([tx]);
    return MerkleTxs.fromTxs(txs);
  }
}
