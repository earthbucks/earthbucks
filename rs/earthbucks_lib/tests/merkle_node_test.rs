use earthbucks_lib::hash::*;
use earthbucks_lib::merkle_node::*;

#[test]
fn from_iso_bufs_1_data() {
    let data = double_blake3_hash("data1".as_bytes()).to_vec();
    let root = MerkleNode::from_iso_bufs(vec![data]);
    let hex = hex::encode(root.hash());
    assert_eq!(
        hex,
        "689ce4d2c5a083571f0a1b1d8d4bb9a5b5494aba2c98eb606c1d265681ac5244"
    );
}

#[test]
fn from_iso_bufs_2_datas() {
    let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
    let data2 = double_blake3_hash("data2".as_bytes()).to_vec();

    let data = vec![data1, data2];
    let root = MerkleNode::from_iso_bufs(data);
    let hex = hex::encode(root.hash());
    assert_eq!(
        hex,
        "fdc77b5c255818023a45501e5a5ce7f2e0ea275546cad26df121d4b8f17d8cde"
    );
}

#[test]
fn from_iso_bufs_4_datas() {
    let data1 = double_blake3_hash("data1".as_bytes()).to_vec();
    let data2 = double_blake3_hash("data2".as_bytes()).to_vec();
    let data3 = double_blake3_hash("data3".as_bytes()).to_vec();
    let data4 = double_blake3_hash("data4".as_bytes()).to_vec();

    let data = vec![data1, data2, data3, data4];
    let root = MerkleNode::from_iso_bufs(data);
    let hex = hex::encode(root.hash());
    assert_eq!(
        hex,
        "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187"
    );
}
