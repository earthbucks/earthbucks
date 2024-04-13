use crate::blake3::double_blake3_hash;
use crate::buffer::Buffer;

pub struct Pkh {
    pub pkh: [u8; 32],
}

impl Pkh {
    pub fn new(public_key: Vec<u8>) -> Self {
        let pkh = double_blake3_hash(&public_key);
        Self { pkh }
    }

    pub fn from_pub_key_buf(public_key: Vec<u8>) -> Self {
        Self::new(public_key)
    }

    pub fn from_hex(hex: &str) -> Result<Self, String> {
        let pkh_buf = Buffer::from_hex(hex).to_u8_vec();
        if pkh_buf.len() != 32 {
            return Err("Invalid pkh length".to_string());
        }
        Ok(Self { pkh: pkh_buf.try_into().unwrap()})
    }

    pub fn from_string(hex: &str) -> Result<Self, String> {
        Self::from_hex(hex)
    }

    pub fn pkh(&self) -> &[u8; 32] {
        &self.pkh
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex;
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
        let pkh = Pkh::new(pub_key);

        // Check that the pkh matches the expected pkh
        assert_eq!(pkh.pkh(), &expected_pkh);
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
        let data = fs::read_to_string("../../json/pkh.json").expect("Unable to read file");

        // Parse the JSON data
        let pkh_data: PkhData = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in pkh_data.pkh {
            // Convert hex to bytes
            let pub_key = hex::decode(&pair.pub_key).expect("Decoding failed");
            let expected_pkh_vec = hex::decode(&pair.pkh).expect("Decoding failed");

            // Convert Vec<u8> to [u8; 32]
            let mut expected_pkh = [0; 32];
            expected_pkh.copy_from_slice(&expected_pkh_vec[..]);

            // Create a new Address instance
            let pkh = Pkh::new(pub_key);

            // Check that the pkh matches the expected pkh
            assert_eq!(pkh.pkh(), &expected_pkh);
        }
    }
}
