use crate::buffer::Buffer;
use crate::priv_key::PrivKey;
use secp256k1::PublicKey;

#[derive(Debug, Clone)]
pub struct PubKey {
    pub pub_key: [u8; 33],
}

impl PubKey {
    pub fn new(pub_key: [u8; 33]) -> Self {
        PubKey { pub_key }
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Self {
        let pub_key_buf = priv_key.to_pub_key_buf();
        PubKey::new(pub_key_buf)
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.pub_key)
    }

    pub fn from_hex(hex: &str) -> Self {
        let pub_key_buf: [u8; 33] = Buffer::from_hex(hex).data.try_into().unwrap();
        PubKey::new(pub_key_buf)
    }

    pub fn to_string(&self) -> String {
        self.to_hex()
    }

    pub fn from_string(s: &str) -> Self {
        PubKey::from_hex(s)
    }

    pub fn is_valid(&self) -> bool {
        let public_key_obj = PublicKey::from_slice(&self.pub_key);
        public_key_obj.is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_priv_key() {
        let priv_key = PrivKey::from_random();
        let pub_key = PubKey::from_priv_key(&priv_key);
        println!("priv_key: {}", priv_key.to_hex());
        println!("pub_key: {}", pub_key.to_hex());
    }

    #[test]
    fn test_is_valid() {
        let priv_key = PrivKey::from_random();
        let pub_key = PubKey::from_priv_key(&priv_key);
        assert!(pub_key.is_valid());
    }

    #[test]
    fn test_is_not_valid() {
        // valid: 035b3ea48a27d75cef083a1e216d91a653577566aad51b22701d002e4ea9fc2219
        let invalid = "065b3ea48a27d75cef083a1e216d91a653577566aad51b22701d002e4ea9fc2219";
        let pub_key = PubKey::from_string(invalid);
        assert!(!pub_key.is_valid());
    }
}
