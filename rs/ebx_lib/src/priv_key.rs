extern crate secp256k1;
use crate::buffer::Buffer;
use rand::Rng;

use secp256k1::{PublicKey, SecretKey};

#[derive(Clone, Debug)]
pub struct PrivKey {
    pub priv_key: [u8; 32],
}

impl PrivKey {
    pub fn new(priv_key: [u8; 32]) -> Self {
        PrivKey { priv_key }
    }

    pub fn from_random() -> Self {
        let mut rng = rand::thread_rng();
        let mut key_data = [0u8; 32];
        loop {
            rng.fill(&mut key_data);
            if let Ok(secret_key) = SecretKey::from_slice(&key_data) {
                return PrivKey::new(*secret_key.as_ref());
            }
        }
    }

    pub fn to_pub_key_buf(&self) -> [u8; 33] {
        let secret_key = SecretKey::from_slice(&self.priv_key).unwrap();
        let secp = secp256k1::Secp256k1::new();
        let public_key_obj = PublicKey::from_secret_key(&secp, &secret_key);
        public_key_obj.serialize().to_vec().try_into().unwrap()
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.priv_key)
    }

    pub fn from_hex(hex: &str) -> Self {
        let priv_key: [u8; 32] = Buffer::from_hex(hex).data.try_into().unwrap();
        PrivKey::new(priv_key)
    }

    pub fn to_string(&self) -> String {
        self.to_hex()
    }

    pub fn from_string(s: &str) -> Self {
        PrivKey::from_hex(s)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_random() {
        let priv_key = PrivKey::from_random();
        println!("priv_key: {}", priv_key.to_hex());
    }

    #[test]
    fn test_to_pub_key_buf() {
        let priv_key = PrivKey::from_random();
        let pub_key_buf = priv_key.to_pub_key_buf();
        println!("pub_key_buf: {}", hex::encode(&pub_key_buf));
    }

    #[test]
    fn test_to_hex() {
        let priv_key = PrivKey::from_random();
        let hex = priv_key.to_hex();
        println!("hex: {}", hex);
    }

    #[test]
    fn test_from_hex() {
        let priv_key = PrivKey::from_random();
        let hex = priv_key.to_hex();
        let priv_key2 = PrivKey::from_hex(&hex);
        assert_eq!(priv_key.priv_key, priv_key2.priv_key);
    }

    #[test]
    fn test_to_string() {
        let priv_key = PrivKey::from_random();
        let s = priv_key.to_string();
        println!("s: {}", s);
    }

    #[test]
    fn test_from_string() {
        let priv_key = PrivKey::from_random();
        let s = priv_key.to_string();
        let priv_key2 = PrivKey::from_string(&s);
        assert_eq!(priv_key.priv_key, priv_key2.priv_key);
    }

    #[test]
    fn test_from_slice() {
        let priv_key = PrivKey::from_random();
        let priv_key2 = PrivKey::new(priv_key.priv_key);
        assert_eq!(priv_key.priv_key, priv_key2.priv_key);
    }

    #[test]
    fn test_from_slice_invalid() {
        let priv_key = PrivKey::from_random();
        let mut priv_key2 = priv_key.priv_key;
        priv_key2[0] = priv_key2[0].wrapping_add(1);
        assert!(PrivKey::new(priv_key2).priv_key != priv_key.priv_key);
    }

    #[test]
    fn test_this_priv_key_vec() {
        let priv_key =
            PrivKey::from_hex("2ef930fed143c0b92b485c29aaaba97d09cab882baafdb9ea1e55dec252cd09f");
        let pub_key_buf = priv_key.to_pub_key_buf();
        let pub_key_hex = Buffer::from(pub_key_buf.to_vec()).to_hex();
        assert_eq!(
            pub_key_hex,
            "03f9bd9639017196c2558c96272d0ea9511cd61157185c98ae3109a28af058db7b"
        );
    }
}
