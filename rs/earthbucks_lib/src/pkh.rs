use crate::ebx_error::EbxError;
use crate::hash::{blake3_hash, double_blake3_hash};
use crate::iso_hex;
use crate::pub_key;
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

    pub fn from_iso_hex(hex: &str) -> Result<Self, EbxError> {
        let pkh_buf = iso_hex::decode(hex)?.to_vec();
        if pkh_buf.len() != 32 {
            return Err(EbxError::InvalidKeyError { source: None });
        }
        Ok(Self {
            buf: pkh_buf.try_into().unwrap(),
        })
    }

    pub fn to_iso_buf(&self) -> &[u8; 32] {
        &self.buf
    }

    pub fn from_iso_buf(buf: &[u8; 32]) -> Self {
        Self { buf: *buf }
    }

    pub fn to_iso_str(&self) -> String {
        let check_buf = blake3_hash(&self.buf);
        let check_sum = &check_buf[0..4];
        let check_hex = iso_hex::encode(check_sum);
        "ebxpkh".to_string() + &check_hex + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_iso_str(s: &str) -> Result<Self, String> {
        if !s.starts_with("ebxpkh") {
            return Err("Invalid pkh prefix".to_string());
        }
        let check_sum = iso_hex::decode(&s[6..14]).map_err(|_| "Invalid pkh checksum")?;

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
        Self::from_iso_str(s).is_ok()
    }
}
