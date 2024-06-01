use crate::ebx_error::EbxError;
use crate::hash::blake3_hash;
use crate::iso_buf::StrictHex;
use crate::priv_key::PrivKey;
use bs58;
use secp256k1::PublicKey;

#[derive(Debug, Clone)]
pub struct PubKey {
    pub buf: [u8; PubKey::SIZE],
}

impl PubKey {
    pub const SIZE: usize = 33;

    pub fn new(pub_key: [u8; PubKey::SIZE]) -> Self {
        PubKey { buf: pub_key }
    }

    pub fn from_iso_buf(vec: Vec<u8>) -> Result<Self, EbxError> {
        if vec.len() > PubKey::SIZE {
            return Err(EbxError::TooMuchDataError { source: None });
        }
        if vec.len() < PubKey::SIZE {
            return Err(EbxError::NotEnoughDataError { source: None });
        }
        let mut pub_key = [0u8; PubKey::SIZE];
        pub_key.copy_from_slice(&vec);
        Ok(PubKey::new(pub_key))
    }

    pub fn to_buffer(&self) -> &[u8; PubKey::SIZE] {
        &self.buf
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Result<Self, EbxError> {
        let pub_key_buf = priv_key.to_pub_key_buffer();
        if pub_key_buf.is_err() {
            return Err(EbxError::InvalidKeyError { source: None });
        }
        Ok(PubKey::new(pub_key_buf.unwrap()))
    }

    pub fn to_iso_hex(&self) -> String {
        hex::encode(self.buf)
    }

    pub fn from_iso_hex(hex: &str) -> Result<PubKey, EbxError> {
        let pub_key_buf: Vec<u8> = Vec::<u8>::from_strict_hex(hex)?;
        PubKey::from_iso_buf(pub_key_buf)
    }

    pub fn to_iso_str(&self) -> String {
        let check_hash = blake3_hash(&self.buf);
        let check_sum: [u8; 4] = check_hash[0..4].try_into().unwrap();
        let check_hex = check_sum.to_strict_hex();
        "ebxpub".to_string() + &check_hex + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_iso_str(s: &str) -> Result<PubKey, EbxError> {
        if !s.starts_with("ebxpub") {
            return Err(EbxError::InvalidEncodingError { source: None });
        }
        let check_str = &s[6..14];
        let check_buf: [u8; 4] = <[u8; 4]>::from_strict_hex(check_str)?;
        let buf = bs58::decode(&s[14..])
            .into_vec()
            .map_err(|_| EbxError::InvalidEncodingError { source: None })?;
        let check_hash = blake3_hash(&buf);
        let check_sum = &check_hash[0..4];
        if check_buf != check_sum {
            return Err(EbxError::InvalidChecksumError { source: None });
        }
        PubKey::from_iso_buf(buf)
    }

    pub fn is_valid(&self) -> bool {
        let public_key_obj = PublicKey::from_slice(&self.buf);
        public_key_obj.is_ok()
    }

    pub fn is_valid_string_fmt(s: &str) -> bool {
        let res = Self::from_iso_str(s);
        res.is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_priv_key() {
        let priv_key = PrivKey::from_random();
        let pub_key = PubKey::from_priv_key(&priv_key).unwrap();
        println!("priv_key: {}", priv_key.to_iso_str());
        println!("pub_key: {}", pub_key.to_iso_hex());
    }

    #[test]
    fn test_is_valid() {
        let priv_key = PrivKey::from_random();
        let pub_key = PubKey::from_priv_key(&priv_key);
        assert!(pub_key.unwrap().is_valid());
    }

    #[test]
    fn test_is_not_valid() {
        let invalid = "065b3ea48a27d75cef083a1e216d91a653577566aad51b22701d002e4ea9fc2219";
        let pub_key = PubKey::from_iso_hex(invalid).unwrap();
        assert!(!pub_key.is_valid());
    }

    #[test]
    fn test_to_from_iso_str_format() {
        assert!(PubKey::is_valid_string_fmt(
            "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo"
        ));
        assert!(!PubKey::is_valid_string_fmt(
            "ebxpu5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo"
        ));
        assert!(!PubKey::is_valid_string_fmt(
            "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYV"
        ));
    }
}
