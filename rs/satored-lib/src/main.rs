extern crate rand;
extern crate secp256k1;
extern crate sha2;

use rand::{rngs::OsRng, Rng};
use secp256k1::{PublicKey, SecretKey};
use sha2::{Digest, Sha256};

pub struct Key {
    private_key: SecretKey,
    public_key: PublicKey,
}

impl Key {
    pub fn new(private_key: SecretKey) -> Self {
        let secp = secp256k1::Secp256k1::new();
        let public_key = PublicKey::from_secret_key(&secp, &private_key);
        Key {
            private_key,
            public_key,
        }
    }

    pub fn private_key(&self) -> &SecretKey {
        &self.private_key
    }

    pub fn public_key(&self) -> &PublicKey {
        &self.public_key
    }

    pub fn single_hash(data: &[u8]) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hasher.finalize().to_vec()
    }

    pub fn double_hash(data: &[u8]) -> Vec<u8> {
        Self::single_hash(&Self::single_hash(data))
    }

    pub fn single_address(&self) -> Vec<u8> {
        Self::single_hash(&self.public_key.serialize())
    }

    pub fn double_address(&self) -> Vec<u8> {
        Self::double_hash(&self.public_key.serialize())
    }

    pub fn from_random() -> Self {
        let mut rng = OsRng;
        let mut key_data = [0u8; 32];
        loop {
            rng.fill(&mut key_data);
            if let Ok(private_key) = SecretKey::from_slice(&key_data) {
                return Self::new(private_key);
            }
        }
    }
}

fn main() {
    let key = Key::from_random();
    let private_key_hex = key.private_key().to_string();
    let public_key_hex = key.public_key().to_string();

    println!("Private key: {}", private_key_hex);
    println!("Public key: {}", public_key_hex);
}