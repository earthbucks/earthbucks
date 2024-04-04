use crate::blake3::double_blake3_hash;

pub struct PubKeyHash {
    pub pub_key_hash: [u8; 32],
}

impl PubKeyHash {
    pub fn new(public_key: Vec<u8>) -> Self {
        let pub_key_hash = double_blake3_hash(&public_key);
        Self { pub_key_hash }
    }

    pub fn from_public_key(public_key: Vec<u8>) -> Self {
        Self::new(public_key)
    }

    pub fn pub_key_hash(&self) -> &[u8; 32] {
        &self.pub_key_hash
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex;
    use serde::Deserialize;
    use std::fs;

    #[test]
    fn test_pub_key_hash() {
        let pub_key_hex = "0317fab5ac778e983f2ccd9faadc1524e1e3a49623d28e1a73309bf9d0fb72b53d";
        let expected_pub_key_hash_hex =
            "601c2893ab7febcf1b3b43e91d98360966f52c98d8f98f29be52ece37b1cff84";

        // Convert hex to bytes
        let pub_key = hex::decode(pub_key_hex).expect("Decoding failed");
        let expected_pub_key_hash_vec =
            hex::decode(expected_pub_key_hash_hex).expect("Decoding failed");

        // Convert Vec<u8> to [u8; 32]
        let mut expected_pub_key_hash = [0; 32];
        expected_pub_key_hash.copy_from_slice(&expected_pub_key_hash_vec[..]);

        // Create a new PubKeyHash instance
        let pub_key_hash = PubKeyHash::new(pub_key);

        // Check that the pub_key_hash matches the expected pub_key_hash
        assert_eq!(pub_key_hash.pub_key_hash(), &expected_pub_key_hash);
    }

    #[derive(Deserialize)]
    struct PubKeyHashData {
        pub_key_hash: Vec<PubKeyHashPair>,
    }

    #[derive(Deserialize)]
    struct PubKeyHashPair {
        pub_key: String,
        pub_key_hash: String,
    }

    #[test]
    fn test_pub_key_hash_pairs() {
        // Read the JSON file
        let data = fs::read_to_string("../../json/pub_key_hash.json").expect("Unable to read file");

        // Parse the JSON data
        let pub_key_hash_data: PubKeyHashData =
            serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in pub_key_hash_data.pub_key_hash {
            // Convert hex to bytes
            let pub_key = hex::decode(&pair.pub_key).expect("Decoding failed");
            let expected_pub_key_hash_vec =
                hex::decode(&pair.pub_key_hash).expect("Decoding failed");

            // Convert Vec<u8> to [u8; 32]
            let mut expected_pub_key_hash = [0; 32];
            expected_pub_key_hash.copy_from_slice(&expected_pub_key_hash_vec[..]);

            // Create a new PubKeyHash instance
            let pub_key_hash = PubKeyHash::new(pub_key);

            // Check that the pub_key_hash matches the expected pub_key_hash
            assert_eq!(pub_key_hash.pub_key_hash(), &expected_pub_key_hash);
        }
    }
}
