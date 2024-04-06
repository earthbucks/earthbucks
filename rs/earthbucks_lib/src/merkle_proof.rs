use crate::blake3::double_blake3_hash;

#[derive(Debug, Clone)]
pub struct MerkleProof {
    root: Vec<u8>,
    proof: Vec<(Vec<u8>, bool)>,
}

impl MerkleProof {
    pub fn new(root: Vec<u8>, proof: Vec<(Vec<u8>, bool)>) -> Self {
        Self { root, proof }
    }

    pub fn verify(&self, hashed_data: &[u8]) -> bool {
        let mut hash = hashed_data.to_vec();
        for (sibling, is_left) in &self.proof {
            hash = if *is_left {
                let mut new_hash = sibling.clone();
                new_hash.extend_from_slice(&hash);
                double_blake3_hash(&new_hash).to_vec()
            } else {
                let mut new_hash = hash.clone();
                new_hash.extend_from_slice(sibling);
                double_blake3_hash(&new_hash).to_vec()
            }
        }
        hash == self.root
    }

    pub fn verify_proof(data: &[u8], proof: &MerkleProof, root: &[u8]) -> bool {
        proof.root == root || proof.verify(data)
    }

    pub fn generate_proofs_and_root(hashed_datas: Vec<Vec<u8>>) -> (Vec<u8>, Vec<MerkleProof>) {
        if hashed_datas.is_empty() {
            panic!("Cannot create Merkle tree from empty array");
        }
        if hashed_datas.len() == 1 {
            let root = hashed_datas[0].clone();
            let proof = MerkleProof::new(root.clone(), vec![]);
            return (root, vec![proof]);
        }
        if hashed_datas.len() == 2 {
            let mut combined = Vec::new();
            combined.extend_from_slice(&hashed_datas[0]);
            combined.extend_from_slice(&hashed_datas[1]);
            let root = double_blake3_hash(&combined).to_vec();
            let proofs = vec![
                MerkleProof::new(root.clone(), vec![(hashed_datas[1].clone(), true)]),
                MerkleProof::new(root.clone(), vec![(hashed_datas[0].clone(), false)]),
            ];
            return (root, proofs);
        }
        let mut hashed_datas = hashed_datas;
        while hashed_datas.len() & (hashed_datas.len() - 1) != 0 {
            hashed_datas.push(hashed_datas.last().unwrap().clone());
        }
        let (left_root, left_proofs) =
            Self::generate_proofs_and_root(hashed_datas[..hashed_datas.len() / 2].to_vec());
        let (right_root, right_proofs) =
            Self::generate_proofs_and_root(hashed_datas[hashed_datas.len() / 2..].to_vec());
        let mut combined = Vec::new();
        combined.extend_from_slice(&left_root);
        combined.extend_from_slice(&right_root);
        let root = double_blake3_hash(&combined).to_vec();
        let proofs = [
            left_proofs
                .into_iter()
                .map(|proof| {
                    MerkleProof::new(
                        root.clone(),
                        [(right_root.clone(), true)]
                            .into_iter()
                            .chain(proof.proof.into_iter())
                            .collect(),
                    )
                })
                .collect::<Vec<_>>(),
            right_proofs
                .into_iter()
                .map(|proof| {
                    MerkleProof::new(
                        root.clone(),
                        [(left_root.clone(), false)]
                            .into_iter()
                            .chain(proof.proof.into_iter())
                            .collect(),
                    )
                })
                .collect::<Vec<_>>(),
        ]
        .concat();
        (root, proofs)
    }
}
