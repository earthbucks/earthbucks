extern crate rand;
extern crate secp256k1;

use rand::{rngs::OsRng, Rng};
use secp256k1::{PublicKey, SecretKey};

pub struct Key {
    private_key: Vec<u8>,
    public_key: Vec<u8>,
}

impl Key {
    pub fn new(private_key: Vec<u8>) -> Self {
        let secret_key = SecretKey::from_slice(&private_key).unwrap();
        let secp = secp256k1::Secp256k1::new();
        let public_key_obj = PublicKey::from_secret_key(&secp, &secret_key);
        let public_key = public_key_obj.serialize().to_vec();

        Key {
            private_key,
            public_key,
        }
    }

    pub fn private_key(&self) -> &Vec<u8> {
        &self.private_key
    }

    pub fn public_key(&self) -> &Vec<u8> {
        &self.public_key
    }

    pub fn from_random() -> Self {
        let mut rng = OsRng;
        let mut key_data = [0u8; 32];
        loop {
            rng.fill(&mut key_data);
            if let Ok(secret_key) = SecretKey::from_slice(&key_data) {
                let private_key = secret_key.as_ref().to_vec();
                return Self::new(private_key);
            }
        }
    }
}

// standard test vectors: key.json
#[cfg(test)]
mod tests {
    use super::*;
    use secp256k1::SecretKey;
    use serde::Deserialize;
    use std::fs;

    #[derive(Deserialize)]
    struct KeyPair {
        priv_key: String,
        pub_key: String,
    }

    #[derive(Deserialize)]
    struct KeyPairs {
        key_pair: Vec<KeyPair>,
    }

    #[test]
    fn test_key_pairs() {
        let data = fs::read_to_string("../../json/key.json").expect("Unable to read file");
        let key_pairs: KeyPairs = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in key_pairs.key_pair {
            let private_key_data = hex::decode(&pair.priv_key).unwrap();
            let secret_key = SecretKey::from_slice(&private_key_data).unwrap();
            let private_key = secret_key.as_ref().to_vec();
            let key = Key::new(private_key);

            let expected_public_key = &pair.pub_key;
            let actual_public_key = hex::encode(key.public_key());

            assert_eq!(expected_public_key, &actual_public_key);
        }
    }
}
