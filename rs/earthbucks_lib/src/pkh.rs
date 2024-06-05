use crate::buf::EbxBuf;
use crate::error::EbxError;
use crate::hash::{blake3_hash, double_blake3_hash};
use crate::pub_key;

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

    pub fn from_strict_hex(hex: &str) -> Result<Self, EbxError> {
        let pkh_buf = <[u8; 32]>::from_strict_hex(hex)?.to_vec();
        if pkh_buf.len() != 32 {
            return Err(EbxError::InvalidKeyError { source: None });
        }
        Ok(Self {
            buf: pkh_buf.try_into().unwrap(),
        })
    }

    pub fn to_buf(&self) -> &[u8; 32] {
        &self.buf
    }

    pub fn from_buf(buf: &[u8; 32]) -> Self {
        Self { buf: *buf }
    }

    pub fn to_strict_str(&self) -> String {
        let check_buf = blake3_hash(&self.buf);
        let check_sum: [u8; 4] = check_buf[0..4].try_into().unwrap();
        let check_hex = check_sum.to_strict_hex();
        "ebxpkh".to_string() + &check_hex + &self.buf.to_base58()
    }

    pub fn from_strict_str(s: &str) -> Result<Self, EbxError> {
        if !s.starts_with("ebxpkh") {
            return Err(EbxError::InvalidEncodingError { source: None });
        }
        let check_sum = <[u8; 4]>::from_strict_hex(&s[6..14])?;

        let buf = Vec::<u8>::from_base58(&s[14..])?;
        let check_buf = blake3_hash(&buf);
        let expected_check_sum = &check_buf[0..4];
        if check_sum != expected_check_sum {
            return Err(EbxError::InvalidChecksumError { source: None });
        }
        if buf.len() != 32 {
            return Err(EbxError::InvalidSizeError { source: None });
        }
        Ok(Self {
            buf: buf.try_into().unwrap(),
        })
    }

    pub fn is_valid_string_fmt(s: &str) -> bool {
        Self::from_strict_str(s).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use crate::pub_key::PubKey;

    use super::*;
    use serde::Deserialize;
    use std::fs;

    #[test]
    fn test_pkh() {
        let pub_key_hex = "0317fab5ac778e983f2ccd9faadc1524e1e3a49623d28e1a73309bf9d0fb72b53d";
        let expected_pkh_hex = "601c2893ab7febcf1b3b43e91d98360966f52c98d8f98f29be52ece37b1cff84";

        // Convert hex to bytes
        let pub_key = Vec::<u8>::from_strict_hex(pub_key_hex).expect("Decoding failed");
        let expected_pkh_vec =
            Vec::<u8>::from_strict_hex(expected_pkh_hex).expect("Decoding failed");

        // Convert Vec<u8> to [u8; 32]
        let mut expected_pkh = [0; 32];
        expected_pkh.copy_from_slice(&expected_pkh_vec[..]);

        // Create a new Address instance
        let pkh = Pkh::from_pub_key_buffer(pub_key);

        // Check that the pkh matches the expected pkh
        assert_eq!(pkh.to_buf(), &expected_pkh);
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
            Pkh::from_strict_str("ebxpkh31a042833G3ZzV3uEraE8B2Pvea3rKP2QkaQRVZkxmADrm3LEcN4")
                .unwrap();
        assert_eq!(
            pkh.to_strict_str(),
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
            let pub_key = PubKey::from_strict_str(&pair.pub_key).unwrap();

            // Create a new Address instance
            let pkh = Pkh::from_pub_key(pub_key);

            // Check that the pkh matches the expected pkh
            assert_eq!(pkh.to_strict_str(), pair.pkh);
        }
    }
}
