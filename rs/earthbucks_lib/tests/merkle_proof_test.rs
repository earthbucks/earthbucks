
use earthbucks_lib::hash::*;
use earthbucks_lib::merkle_proof::*;

#[test]
fn generate_proofs_and_root_with_1_data() {
    let data1 = double_blake3_hash("data1".as_bytes());

    let data = vec![data1];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
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
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());

    let data = vec![data1, data2];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
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
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());

    let data = vec![data1, data2, data3];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
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
fn verify_position_with_3_datas() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());

    let data = vec![data1, data2, data3];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
    assert_eq!(
        hex,
        "30a6a79ea9df78385494a1df6a6eeb4fcf318929899fd0b6c96bba0724bcecdf"
    );

    let proof1 = &proofs[0];
    let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
    assert!(verified1);
    let valid_position1 = proof1.position_in_tree();
    assert_eq!(valid_position1, 0);

    let proof2 = &proofs[1];
    let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
    assert!(verified2);
    let valid_position2 = proof2.position_in_tree();
    assert_eq!(valid_position2, 1);

    let proof3 = &proofs[2];
    let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
    assert!(verified3);
    let valid_position3 = proof3.position_in_tree();
    assert_eq!(valid_position3, 2);
}

#[test]
fn generate_proofs_and_root_with_4_datas() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());
    let data4 = double_blake3_hash("data4".as_bytes());

    let data = vec![data1, data2, data3, data4];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
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
fn verify_position_with_4_datas() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());
    let data4 = double_blake3_hash("data4".as_bytes());

    let data = vec![data1, data2, data3, data4];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
    assert_eq!(
        hex,
        "a3344f480b6c8102dd11ad1b686aa2b890b8455bd5343f66b33d392b05b4f187"
    );

    let proof1 = &proofs[0];
    let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
    assert!(verified1);
    let valid_position1 = proof1.position_in_tree();
    assert_eq!(valid_position1, 0);

    let proof2 = &proofs[1];
    let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
    assert!(verified2);
    let valid_position2 = proof2.position_in_tree();
    assert_eq!(valid_position2, 1);

    let proof3 = &proofs[2];
    let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
    assert!(verified3);
    let valid_position3 = proof3.position_in_tree();
    assert_eq!(valid_position3, 2);

    let proof4 = &proofs[3];
    let verified4 = MerkleProof::verify_proof(&data4, proof4, &root);
    assert!(verified4);
    let valid_position4 = proof4.position_in_tree();
    assert_eq!(valid_position4, 3);
}

#[test]
fn verify_position_with_8_datas() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());
    let data4 = double_blake3_hash("data4".as_bytes());
    let data5 = double_blake3_hash("data5".as_bytes());
    let data6 = double_blake3_hash("data6".as_bytes());
    let data7 = double_blake3_hash("data7".as_bytes());
    let data8 = double_blake3_hash("data8".as_bytes());

    let data = vec![data1, data2, data3, data4, data5, data6, data7, data8];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
    assert_eq!(
        hex,
        "fc4b21e6bdd266c1808fe1f511d0da1eaf7a589ba581b580bb8cb6bb1d8663d6"
    );

    let proof1 = &proofs[0];
    let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
    assert!(verified1);
    let valid_position1 = proof1.position_in_tree();
    assert_eq!(valid_position1, 0);

    let proof2 = &proofs[1];
    let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
    assert!(verified2);
    let valid_position2 = proof2.position_in_tree();
    assert_eq!(valid_position2, 1);

    let proof3 = &proofs[2];
    let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
    assert!(verified3);
    let valid_position3 = proof3.position_in_tree();
    assert_eq!(valid_position3, 2);

    let proof4 = &proofs[3];
    let verified4 = MerkleProof::verify_proof(&data4, proof4, &root);
    assert!(verified4);
    let valid_position4 = proof4.position_in_tree();
    assert_eq!(valid_position4, 3);

    let proof5 = &proofs[4];
    let verified5 = MerkleProof::verify_proof(&data5, proof5, &root);
    assert!(verified5);
    let valid_position5 = proof5.position_in_tree();
    assert_eq!(valid_position5, 4);

    let proof6 = &proofs[5];
    let verified6 = MerkleProof::verify_proof(&data6, proof6, &root);
    assert!(verified6);
    let valid_position6 = proof6.position_in_tree();
    assert_eq!(valid_position6, 5);

    let proof7 = &proofs[6];
    let verified7 = MerkleProof::verify_proof(&data7, proof7, &root);
    assert!(verified7);
    let valid_position7 = proof7.position_in_tree();
    assert_eq!(valid_position7, 6);

    let proof8 = &proofs[7];
    let verified8 = MerkleProof::verify_proof(&data8, proof8, &root);
    assert!(verified8);
    let valid_position8 = proof8.position_in_tree();
    assert_eq!(valid_position8, 7);
}

#[test]
fn verify_position_with_9_datas() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let data3 = double_blake3_hash("data3".as_bytes());
    let data4 = double_blake3_hash("data4".as_bytes());
    let data5 = double_blake3_hash("data5".as_bytes());
    let data6 = double_blake3_hash("data6".as_bytes());
    let data7 = double_blake3_hash("data7".as_bytes());
    let data8 = double_blake3_hash("data8".as_bytes());
    let data9 = double_blake3_hash("data9".as_bytes());

    let data = vec![
        data1, data2, data3, data4, data5, data6, data7, data8, data9,
    ];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
    assert_eq!(
        hex,
        "11be5d17fee5f6858e594524337f5e39511c78f668f2a8bdf1efbb33921aaaa0"
    );

    let proof1 = &proofs[0];
    let verified1 = MerkleProof::verify_proof(&data1, proof1, &root);
    assert!(verified1);
    let valid_position1 = proof1.position_in_tree();
    assert_eq!(valid_position1, 0);

    let proof2 = &proofs[1];
    let verified2 = MerkleProof::verify_proof(&data2, proof2, &root);
    assert!(verified2);
    let valid_position2 = proof2.position_in_tree();
    assert_eq!(valid_position2, 1);

    let proof3 = &proofs[2];
    let verified3 = MerkleProof::verify_proof(&data3, proof3, &root);
    assert!(verified3);
    let valid_position3 = proof3.position_in_tree();
    assert_eq!(valid_position3, 2);

    let proof4 = &proofs[3];
    let verified4 = MerkleProof::verify_proof(&data4, proof4, &root);
    assert!(verified4);
    let valid_position4 = proof4.position_in_tree();
    assert_eq!(valid_position4, 3);

    let proof5 = &proofs[4];
    let verified5 = MerkleProof::verify_proof(&data5, proof5, &root);
    assert!(verified5);
    let valid_position5 = proof5.position_in_tree();
    assert_eq!(valid_position5, 4);

    let proof6 = &proofs[5];
    let verified6 = MerkleProof::verify_proof(&data6, proof6, &root);
    assert!(verified6);
    let valid_position6 = proof6.position_in_tree();
    assert_eq!(valid_position6, 5);

    let proof7 = &proofs[6];
    let verified7 = MerkleProof::verify_proof(&data7, proof7, &root);
    assert!(verified7);
    let valid_position7 = proof7.position_in_tree();
    assert_eq!(valid_position7, 6);

    let proof8 = &proofs[7];
    let verified8 = MerkleProof::verify_proof(&data8, proof8, &root);
    assert!(verified8);
    let valid_position8 = proof8.position_in_tree();
    assert_eq!(valid_position8, 7);

    let proof9 = &proofs[8];
    let verified9 = MerkleProof::verify_proof(&data9, proof9, &root);
    assert!(verified9);
    let valid_position9 = proof9.position_in_tree();
    assert_eq!(valid_position9, 8);
}

#[test]
fn generate_proofs_and_root_with_non_unique_data() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data = vec![data1, data1];
    let (root, proofs) = MerkleProof::generate_proofs_and_root(data);
    let hex = hex::encode(root);
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
fn to_iso_buf_and_from_iso_buf() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let proof = MerkleProof::new(data1, vec![(data2, true)]);

    let u8 = proof.to_iso_buf();
    let new_proof = MerkleProof::from_iso_buf(&u8).unwrap();
    let hex1 = hex::encode(proof.root);
    let hex2 = hex::encode(new_proof.root);
    assert_eq!(hex1, hex2);
}

#[test]
fn to_iso_str_and_from_iso_str() {
    let data1 = double_blake3_hash("data1".as_bytes());
    let data2 = double_blake3_hash("data2".as_bytes());
    let proof = MerkleProof::new(data1, vec![(data2, true)]);

    let hex = proof.to_iso_str();
    let new_proof = MerkleProof::from_iso_str(&hex).unwrap();
    let hex1 = hex::encode(proof.root);
    let hex2 = hex::encode(new_proof.root);
    assert_eq!(hex1, hex2);
}
