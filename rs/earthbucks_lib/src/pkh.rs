use crate::blake3::{blake3_hash, double_blake3_hash};
use crate::pub_key;
use crate::strict_hex;
use bs58;

#[derive(Debug, Clone)]
pub struct Pkh {
    pub buf: [u8; 32],
}

impl Pkh {
    pub fn from_pub_key_buffer(pub_key_buf: Vec<u8>) -> Self {
        let buf = double_blake3_hash(&pub_key_buf);
        Self { buf }
    }

    pub fn from_pub_key(pub_key: pub_key::PubKey) -> Self {
        Self::from_pub_key_buffer(pub_key.to_buffer().to_vec())
    }

    pub fn from_hex(hex: &str) -> Result<Self, String> {
        let pkh_buf = strict_hex::decode(hex)?.to_vec();
        if pkh_buf.len() != 32 {
            return Err("Invalid pkh length".to_string());
        }
        Ok(Self {
            buf: pkh_buf.try_into().unwrap(),
        })
    }

    pub fn to_u8_vec(&self) -> &[u8; 32] {
        &self.buf
    }

    pub fn from_u8_vec(buf: &[u8; 32]) -> Self {
        Self { buf: *buf }
    }

    pub fn to_string_fmt(&self) -> String {
        let check_buf = blake3_hash(&self.buf);
        let check_sum = &check_buf[0..4];
        let check_hex = strict_hex::encode(check_sum);
        "ebxpkh".to_string() + &check_hex + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_string_fmt(s: &str) -> Result<Self, String> {
        if !s.starts_with("ebxpkh") {
            return Err("Invalid pkh prefix".to_string());
        }
        let check_sum = strict_hex::decode(&s[6..14]).map_err(|_| "Invalid pkh checksum")?;

        let buf = bs58::decode(&s[14..])
            .into_vec()
            .map_err(|_| "Invalid pkh base58")?;
        let check_buf = blake3_hash(&buf);
        let expected_check_sum = &check_buf[0..4];
        if check_sum != expected_check_sum {
            return Err("Invalid pkh checksum".to_string());
        }
        if buf.len() != 32 {
            return Err("Invalid pkh length".to_string());
        }
        Ok(Self {
            buf: buf.try_into().unwrap(),
        })
    }

    pub fn is_valid_string_fmt(s: &str) -> bool {
        Self::from_string_fmt(s).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use crate::pub_key::PubKey;

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
        let pkh = Pkh::from_pub_key_buffer(pub_key);

        // Check that the pkh matches the expected pkh
        assert_eq!(pkh.to_u8_vec(), &expected_pkh);
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
            Pkh::from_string_fmt("ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4")
                .unwrap();
        assert_eq!(
            pkh.to_string_fmt(),
            "ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4"
        );
    }

    #[test]
    fn test_pkh_pairs() {
        // Read the JSON file
        let data = fs::read_to_string("../../json/pkh.json").expect("Unable to read file");

        // Parse the JSON data
        let pkh_data: PkhData = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in pkh_data.pkh {
            let pub_key = PubKey::from_string_fmt(&pair.pub_key).unwrap();

            // Create a new Address instance
            let pkh = Pkh::from_pub_key(pub_key);

            // Check that the pkh matches the expected pkh
            assert_eq!(pkh.to_string_fmt(), pair.pkh);
        }
    }
}
