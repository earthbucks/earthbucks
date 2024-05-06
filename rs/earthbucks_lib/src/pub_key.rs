use crate::blake3::blake3_hash;
use crate::priv_key::PrivKey;
use crate::iso_hex;
use bs58;
use secp256k1::PublicKey;

#[derive(Debug, Clone)]
pub struct PubKey {
    pub buf: [u8; 33],
}

impl PubKey {
    pub fn new(pub_key: [u8; 33]) -> Self {
        PubKey { buf: pub_key }
    }

    pub fn from_iso_buf(vec: Vec<u8>) -> Result<Self, String> {
        if vec.len() != 33 {
            return Err("Invalid buffer length".to_string());
        }
        let mut pub_key = [0u8; 33];
        pub_key.copy_from_slice(&vec);
        Ok(PubKey::new(pub_key))
    }

    pub fn to_buffer(&self) -> &[u8; 33] {
        &self.buf
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Result<Self, String> {
        let pub_key_buf = priv_key.to_pub_key_buffer();
        if pub_key_buf.is_err() {
            return Err(pub_key_buf.err().unwrap());
        }
        Ok(PubKey::new(pub_key_buf.unwrap()))
    }

    pub fn to_iso_hex(&self) -> String {
        hex::encode(self.buf)
    }

    pub fn from_iso_hex(hex: &str) -> Result<PubKey, String> {
        let pub_key_buf = iso_hex::decode(hex)?;
        PubKey::from_iso_buf(pub_key_buf)
    }

    pub fn to_iso_str(&self) -> String {
        let check_hash = blake3_hash(&self.buf);
        let check_sum = &check_hash[0..4];
        let check_hex = hex::encode(check_sum);
        "ebxpub".to_string() + &check_hex + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_iso_str(s: &str) -> Result<PubKey, String> {
        if !s.starts_with("ebxpub") {
            return Err("Invalid format".to_string());
        }
        let check_str = &s[6..14];
        let check_buf = iso_hex::decode(check_str).map_err(|_| "Invalid hex pub key")?;
        let buf = bs58::decode(&s[14..])
            .into_vec()
            .map_err(|_| "Invalid base58")?;
        let check_hash = blake3_hash(&buf);
        let check_sum = &check_hash[0..4];
        if check_buf != check_sum {
            return Err("Invalid checksum".to_string());
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
    fn test_to_from_string_format() {
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
