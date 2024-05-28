use earthbucks_lib::key_pair::*;
use earthbucks_lib::priv_key::*;
use serde::Deserialize;
use std::fs;

#[test]
fn test_is_valid() {
    let key_pair = KeyPair::from_random();
    assert!(key_pair.is_valid());
}

// standard test vectors: key_pair.json
#[derive(Deserialize)]
struct JsonKeyPair {
    priv_key: String,
    pub_key: String,
}

#[derive(Deserialize)]
struct JsonKeyPairs {
    key_pair: Vec<JsonKeyPair>,
}

#[test]
fn test_key_pairs() {
    let data = fs::read_to_string("./test_vectors/key_pair.json").expect("Unable to read file");
    let key_pairs: JsonKeyPairs = serde_json::from_str(&data).expect("Unable to parse JSON");

    for pair in key_pairs.key_pair {
        let priv_key: PrivKey = PrivKey::from_iso_str(&pair.priv_key).unwrap();
        let key_pair = KeyPair::from_priv_key(&priv_key);
        let pub_key = key_pair.unwrap().pub_key;

        let expected_public_key = &pair.pub_key;
        let actual_public_key = pub_key.to_iso_str();

        assert_eq!(expected_public_key, &actual_public_key);
    }
}
