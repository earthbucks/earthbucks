use crate::blake3::double_blake3_hash;
use std::sync::Arc;

pub struct MerkleNode {
    left: Option<Arc<MerkleNode>>,
    right: Option<Arc<MerkleNode>>,
    data: Vec<u8>,
}

impl MerkleNode {
    pub fn new(
        left: Option<Arc<MerkleNode>>,
        right: Option<Arc<MerkleNode>>,
        data: Vec<u8>,
    ) -> Self {
        MerkleNode { left, right, data }
    }

    pub fn hash(&self) -> Vec<u8> {
        match (&self.left, &self.right) {
            (Some(left), Some(right)) => {
                double_blake3_hash(&[left.hash(), right.hash()].concat()).to_vec()
            }

            (Some(left), None) => double_blake3_hash(&[left.hash(), left.hash()].concat()).to_vec(),
            (None, Some(right)) => {
                double_blake3_hash(&[right.hash(), right.hash()].concat()).to_vec()
            }
            (None, None) => self.data.clone(),
        }
    }

    pub fn from_u8_vecs(mut datas: Vec<Vec<u8>>) -> Arc<MerkleNode> {
        match datas.len() {
            0 => panic!("Cannot create MerkleNode from empty array"),
            1 => Arc::new(MerkleNode::new(None, None, datas[0].clone())),
            2 => {
                let left = Arc::new(MerkleNode::new(None, None, datas[0].clone()));
                let right = Arc::new(MerkleNode::new(None, None, datas[1].clone()));
                Arc::new(MerkleNode::new(
                    Some(left.clone()),
                    Some(right.clone()),
                    double_blake3_hash(&[left.hash(), right.hash()].concat()).to_vec(),
                ))
            }
            _ => {
                while datas.len() & (datas.len() - 1) != 0 {
                    datas.push(datas[datas.len() - 1].clone());
                }
                let (left_datas, right_datas) = datas.split_at(datas.len() / 2);
                let left = MerkleNode::from_u8_vecs(left_datas.to_vec());
                let right = MerkleNode::from_u8_vecs(right_datas.to_vec());
                Arc::new(MerkleNode::new(
                    Some(left.clone()),
                    Some(right.clone()),
                    double_blake3_hash(&[left.hash(), right.hash()].concat()).to_vec(),
                ))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn from_u8_vecs() {
        let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
        let data2 = double_blake3_hash("data2".as_bytes()).to_vec();
        let data3 = double_blake3_hash("data3".as_bytes()).to_vec();
        let data4 = double_blake3_hash("data4".as_bytes()).to_vec();

        let data = vec![data1, data2, data3, data4];
        let root = MerkleNode::from_u8_vecs(data);
        let hex = hex::encode(root.hash());
        assert_eq!(
            hex,
            "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187"
        );
    }
}
