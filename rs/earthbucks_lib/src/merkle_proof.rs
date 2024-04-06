use crate::blake3::double_blake3_hash;
use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;

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

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut bw = BufferWriter::new();
        bw.write_u8_vec(self.root.clone());
        bw.write_var_int(self.proof.len() as u64);
        for (sibling, is_left) in &self.proof {
            bw.write_u8_vec(sibling.clone());
            bw.write_u8(if *is_left { 1 } else { 0 });
        }
        bw.to_u8_vec()
    }

    pub fn from_u8_vec(u8: &[u8]) -> MerkleProof {
        let mut br = BufferReader::new(u8.to_vec());
        let root = br.read_u8_vec(32);
        let mut proof = vec![];
        let proof_length = br.read_var_int() as usize;
        for _ in 0..proof_length {
            let sibling = br.read_u8_vec(32);
            let is_left = br.read_u8() == 1;
            proof.push((sibling, is_left));
        }
        MerkleProof::new(root, proof)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_proofs_and_root_with_1_data() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();

        let data = vec![data1.clone()];
        let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
        let hex = hex::encode(root.clone());
        assert_eq!(
            hex,
            "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244"
        );

        let proof1 = &proofs[0];
        let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
        assert!(verified1);
    }

    #[test]
    fn generate_proofs_and_root_with_2_datas() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data2 = double_blake3_hash("data2".as_bytes()).to_vec();

        let data = vec![data1.clone(), data2.clone()];
        let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
        let hex = hex::encode(root.clone());
        assert_eq!(
            hex,
            "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde"
        );

        let proof1 = &proofs[0];
        let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
        assert!(verified1);

        let proof2 = &proofs[1];
        let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
        assert!(verified2);
    }

    #[test]
    fn generate_proofs_and_root_with_3_datas() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data2 = double_blake3_hash("data2".as_bytes()).to_vec();
        let data3 = double_blake3_hash("data3".as_bytes()).to_vec();

        let data = vec![data1.clone(), data2.clone(), data3.clone()];
        let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
        let hex = hex::encode(root.clone());
        assert_eq!(
            hex,
            "30a6a79ea9df78385494a1df6a6eeb4fcf318929899fd0b6c96bba0724bcecdf"
        );

        let proof1 = &proofs[0];
        let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
        assert!(verified1);

        let proof2 = &proofs[1];
        let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
        assert!(verified2);

        let proof3 = &proofs[2];
        let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
        assert!(verified3);
    }

    #[test]
    fn generate_proofs_and_root_with_4_datas() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data2 = double_blake3_hash("data2".as_bytes()).to_vec();
        let data3 = double_blake3_hash("data3".as_bytes()).to_vec();
        let data4 = double_blake3_hash("data4".as_bytes()).to_vec();

        let data = vec![data1.clone(), data2.clone(), data3.clone(), data4.clone()];
        let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
        let hex = hex::encode(root.clone());
        assert_eq!(
            hex,
            "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187"
        );

        let proof1 = &proofs[0];
        let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
        assert!(verified1);

        let proof2 = &proofs[1];
        let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
        assert!(verified2);

        let proof3 = &proofs[2];
        let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
        assert!(verified3);

        let proof4 = &proofs[3];
        let verified4 = MerkleProof::verify_proof(&data4, proof4, &root);
        assert!(verified4);
    }

    #[test]
    fn generate_proofs_and_root_with_non_unique_data() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data = vec![data1.clone(), data1.clone()];
        let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
        let hex = hex::encode(root.clone());
        assert_eq!(
            hex,
            "b008a98b438e9964e43bb0b46d985b5750d1bb5831ac97c8bb05868351b221a3"
        );

        let proof1 = &proofs[0];
        let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
        assert!(verified1);

        let proof2 = &proofs[1];
        let verified2 = MerkleProof::verify_proof(&data1, proof2, &root);
        assert!(verified2);
    }

    #[test]
    fn to_u8_vec_and_from_u8_vec() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data2 = double_blake3_hash("data2".as_bytes()).to_vec();
        let proof = MerkleProof::new(data1.clone(), vec![(data2.clone(), true)]);

        let u8 = proof.to_u8_vec();
        let new_proof = MerkleProof::from_u8_vec(&u8);
        let hex1 = hex::encode(proof.root);
        let hex2 = hex::encode(new_proof.root);
        assert_eq!(hex1, hex2);
    }
}
