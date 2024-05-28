use crate::hash::double_blake3_hash;
use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;

#[derive(Debug, Clone)]
pub struct MerkleProof {
    pub root: [u8; 32],
    pub proof: Vec<([u8; 32], bool)>,
}

impl MerkleProof {
    pub fn new(root: [u8; 32], proof: Vec<([u8; 32], bool)>) -> Self {
        Self { root, proof }
    }

    pub fn verify(&self, hashed_data: &[u8; 32]) -> bool {
        let mut hash = hashed_data.to_vec();
        for (sibling, is_left) in &self.proof {
            hash = if *is_left {
                let mut new_hash = sibling.to_vec();
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

    pub fn verify_proof(data: &[u8; 32], proof: &MerkleProof, root: &[u8; 32]) -> bool {
        proof.root == *root || proof.verify(data)
    }

    pub fn position_in_tree(&self) -> u64 {
        let mut position = 0;
        let len = self.proof.len();
        for (i, (_, is_left)) in self.proof.iter().enumerate() {
            if !is_left {
                position += 1 << (len - 1 - i);
            }
        }
        position
    }

    pub fn generate_proofs_and_root(hashed_datas: Vec<[u8; 32]>) -> ([u8; 32], Vec<MerkleProof>) {
        if hashed_datas.is_empty() {
            panic!("Cannot create Merkle tree from empty array");
        }
        if hashed_datas.len() == 1 {
            let root = hashed_datas[0];
            let proof = MerkleProof::new(root, vec![]);
            return (root, vec![proof]);
        }
        if hashed_datas.len() == 2 {
            let mut combined = Vec::new();
            combined.extend_from_slice(&hashed_datas[0]);
            combined.extend_from_slice(&hashed_datas[1]);
            let root = double_blake3_hash(&combined);
            let proofs = vec![
                MerkleProof::new(root, vec![(hashed_datas[1], true)]),
                MerkleProof::new(root, vec![(hashed_datas[0], false)]),
            ];
            return (root, proofs);
        }
        let mut hashed_datas = hashed_datas;
        while hashed_datas.len() & (hashed_datas.len() - 1) != 0 {
            hashed_datas.push(*hashed_datas.last().unwrap());
        }
        let (left_root, left_proofs) =
            Self::generate_proofs_and_root(hashed_datas[..hashed_datas.len() / 2].to_vec());
        let (right_root, right_proofs) =
            Self::generate_proofs_and_root(hashed_datas[hashed_datas.len() / 2..].to_vec());
        let mut combined = Vec::new();
        combined.extend_from_slice(&left_root);
        combined.extend_from_slice(&right_root);
        let root = double_blake3_hash(&combined);
        let proofs = [
            left_proofs
                .into_iter()
                .map(|proof| {
                    MerkleProof::new(
                        root,
                        [(right_root, true)]
                            .into_iter()
                            .chain(proof.proof)
                            .collect(),
                    )
                })
                .collect::<Vec<_>>(),
            right_proofs
                .into_iter()
                .map(|proof| {
                    MerkleProof::new(
                        root,
                        [(left_root, false)]
                            .into_iter()
                            .chain(proof.proof)
                            .collect(),
                    )
                })
                .collect::<Vec<_>>(),
        ]
        .concat();
        (root, proofs)
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut bw = IsoBufWriter::new();
        bw.write_iso_buf(self.root.to_vec());
        bw.write_var_int(self.proof.len() as u64);
        for (sibling, is_left) in &self.proof {
            bw.write_iso_buf(sibling.to_vec());
            bw.write_u8(if *is_left { 1 } else { 0 });
        }
        bw.to_iso_buf()
    }

    pub fn from_iso_buf(u8: &[u8]) -> Result<MerkleProof, String> {
        let mut br = IsoBufReader::new(u8.to_vec());
        let root: [u8; 32] = br.read(32).map_err(|e| e.to_string())?.try_into().unwrap();
        let mut proof = vec![];
        let proof_length = br.read_var_int().map_err(|e| e.to_string())? as usize;
        for _ in 0..proof_length {
            let sibling: [u8; 32] = br.read(32).map_err(|e| e.to_string())?.try_into().unwrap();
            let is_left = br.read_u8().map_err(|e| e.to_string())? == 1;
            proof.push((sibling, is_left));
        }
        Ok(MerkleProof::new(root, proof))
    }

    pub fn to_iso_str(&self) -> String {
        hex::encode(self.to_iso_buf())
    }

    pub fn from_iso_str(hex: &str) -> Result<MerkleProof, String> {
        MerkleProof::from_iso_buf(&hex::decode(hex).unwrap())
    }
}
