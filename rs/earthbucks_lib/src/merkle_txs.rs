use crate::merkle_proof::MerkleProof;
use crate::tx::Tx;

pub struct MerkleTxs {
    pub txs: Vec<Tx>,
    pub root: [u8; 32],
    pub proofs: Vec<MerkleProof>,
}

impl MerkleTxs {
    pub fn new(txs: Vec<Tx>) -> Self {
        let hashed_datas: Vec<[u8; 32]> = txs.iter().map(|tx| tx.id()).collect::<Vec<_>>();
        let (root, proofs) = MerkleProof::generate_proofs_and_root(hashed_datas);
        Self { txs, root, proofs }
    }

    pub fn get_iterator(&self) -> impl Iterator<Item = (&Tx, &MerkleProof)> {
        self.txs.iter().zip(self.proofs.iter())
    }

    pub fn verify(&self) -> bool {
        for i in 0..self.txs.len() {
            let tx = &self.txs[i];
            let proof = &self.proofs[i];
            if !MerkleProof::verify_proof(&tx.id(), proof, &self.root) {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn verify_with_1_tx() {
        let tx1 = Tx::new(0, vec![], vec![], 0);
        let merkle_txs = MerkleTxs::new(vec![tx1]);
        let verified = merkle_txs.verify();
        assert!(verified);
    }

    #[test]
    fn verify_with_2_txs() {
        let tx1 = Tx::new(0, vec![], vec![], 0);
        let tx2 = Tx::new(0, vec![], vec![], 0);
        let merkle_txs = MerkleTxs::new(vec![tx1, tx2]);
        let verified = merkle_txs.verify();
        assert!(verified);
    }

    #[test]
    fn verify_with_3_txs() {
        let tx1 = Tx::new(0, vec![], vec![], 0);
        let tx2 = Tx::new(0, vec![], vec![], 0);
        let tx3 = Tx::new(0, vec![], vec![], 0);
        let merkle_txs = MerkleTxs::new(vec![tx1, tx2, tx3]);
        let verified = merkle_txs.verify();
        assert!(verified);
    }
}
