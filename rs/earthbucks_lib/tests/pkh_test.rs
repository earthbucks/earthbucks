use earthbucks_lib::pkh::*;
use earthbucks_lib::pub_key::PubKey;
use serde::Deserialize;
use std::fs;

#[test]
fn test_pkh() {
    let pub_key_hex = "0317fab5ac778e983f2ccd9faadc1524e1e3a49623d28e1a73309bf9d0fb72b53d";
    let expected_pkh_hex = "601c2893ab7febcf1b3b43e91d98360966f52c98d8f98f29be52ece37b1cff84";

    // Convert hex to bytes
    let pub_key = hex::decode(pub_key_hex).expect("Decoding failed");
    let expected_pkh_vec = hex::decode(expected_pkh_hex).expect("Decoding failed");

    // Convert Vec<u8> to [u8; 32]
    let mut expected_pkh = [0; 32];
    expected_pkh.copy_from_slice(&expected_pkh_vec[..]);

    // Create a new Address instance
    let pkh = Pkh::from_pub_key_buffer(pub_key);

    // Check that the pkh matches the expected pkh
    assert_eq!(pkh.to_iso_buf(), &expected_pkh);
}

#[test]
fn test_pkh_string_fmt() {
    assert!(Pkh::is_valid_string_fmt(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4"
    ));
    assert!(!Pkh::is_valid_string_fmt(
        "ebxpk31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4"
    ));
    assert!(!Pkh::is_valid_string_fmt(
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN"
    ));

    let pkh =
        Pkh::from_iso_str("ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4").unwrap();
    assert_eq!(
        pkh.to_iso_str(),
        "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4"
    );
}

#[derive(Deserialize)]
struct PkhData {
    pkh: Vec<PkhPair>,
}

#[derive(Deserialize)]
struct PkhPair {
    pub_key: String,
    pkh: String,
}

#[test]
fn test_pkh_pairs() {
    // Read the JSON file
    let data = fs::read_to_string("./test_vectors/pkh.json").expect("Unable to read file");

    // Parse the JSON data
    let pkh_data: PkhData = serde_json::from_str(&data).expect("Unable to parse JSON");

    for pair in pkh_data.pkh {
        let pub_key = PubKey::from_iso_str(&pair.pub_key).unwrap();

        // Create a new Address instance
        let pkh = Pkh::from_pub_key(pub_key);

        // Check that the pkh matches the expected pkh
        assert_eq!(pkh.to_iso_str(), pair.pkh);
    }
}
