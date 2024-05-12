use crate::buffer::Buffer;
use crate::priv_key::PrivKey;
use crate::pub_key::PubKey;

// enable clone
#[derive(Clone, Debug)]
pub struct KeyPair {
    pub priv_key: PrivKey,
    pub pub_key: PubKey,
}

impl KeyPair {
    pub fn new(priv_key: [u8; 32]) -> Result<Self, String> {
        let priv_key = PrivKey::new(priv_key);
        let pub_key = PubKey::from_priv_key(&priv_key);
        if pub_key.is_err() {
            return Err(pub_key.err().unwrap());
        }
        Ok(KeyPair {
            priv_key,
            pub_key: pub_key.unwrap(),
        })
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Result<Self, String> {
        let pub_key = PubKey::from_priv_key(priv_key);
        if pub_key.is_err() {
            return Err(pub_key.err().unwrap());
        }
        Ok(KeyPair {
            priv_key: priv_key.clone(),
            pub_key: pub_key.unwrap(),
        })
    }

    pub fn from_random() -> Self {
        let priv_key = PrivKey::from_random();
        KeyPair::from_priv_key(&priv_key).unwrap()
    }

    pub fn to_buffer(&self) -> Vec<u8> {
        let mut buffer = Vec::new();
        buffer.extend_from_slice(&self.priv_key.buf);
        buffer.extend_from_slice(&self.pub_key.buf);
        buffer
    }

    pub fn from_buffer(buffer: &[u8; 65]) -> Self {
        let priv_key_buf: [u8; 32] = buffer[0..32].try_into().unwrap();
        let pub_key_buf: [u8; 33] = buffer[32..65].try_into().unwrap();
        let priv_key = PrivKey::new(priv_key_buf);
        let pub_key = PubKey::new(pub_key_buf);
        KeyPair { priv_key, pub_key }
    }

    pub fn from_iso_buf(vec: Vec<u8>) -> Result<Self, String> {
        if vec.len() != 65 {
            return Err("Invalid buffer length".to_string());
        }
        let mut buffer = [0u8; 65];
        buffer.copy_from_slice(&vec);
        Ok(KeyPair::from_buffer(&buffer))
    }

    pub fn to_iso_hex(&self) -> String {
        hex::encode(self.to_buffer())
    }

    pub fn from_iso_hex(hex: &str) -> Result<Self, String> {
        let buffer = Buffer::from_iso_hex(hex).data;
        if buffer.len() != 65 {
            return Err("Invalid buffer length".to_string());
        }
        let buffer: [u8; 65] = buffer.try_into().unwrap();
        Ok(KeyPair::from_buffer(&buffer))
    }

    pub fn to_iso_str(&self) -> String {
        self.to_iso_hex()
    }

    pub fn from_iso_str(s: &str) -> Result<Self, String> {
        KeyPair::from_iso_hex(s)
    }

    pub fn is_valid(&self) -> bool {
        let pub_key = PubKey::from_priv_key(&self.priv_key);
        if pub_key.is_err() {
            return false;
        }
        self.pub_key.is_valid() && pub_key.unwrap().buf == self.pub_key.buf
    }
}

// standard test vectors: key_pair.json
#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;
    use std::fs;

    #[derive(Deserialize)]
    struct JsonKeyPair {
        priv_key: String,
        pub_key: String,
    }

    #[derive(Deserialize)]
    struct JsonKeyPairs {
        key_pair: Vec<JsonKeyPair>,
    }

    #[test]
    fn test_key_pairs() {
        let data = fs::read_to_string("../../json/key_pair.json").expect("Unable to read file");
        let key_pairs: JsonKeyPairs = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in key_pairs.key_pair {
            let priv_key: PrivKey = PrivKey::from_iso_str(&pair.priv_key).unwrap();
            let key_pair = KeyPair::from_priv_key(&priv_key);
            let pub_key = key_pair.unwrap().pub_key;

            let expected_public_key = &pair.pub_key;
            let actual_public_key = pub_key.to_iso_str();

            assert_eq!(expected_public_key, &actual_public_key);
        }
    }

    #[test]
    fn test_is_valid() {
        let key_pair = KeyPair::from_random();
        assert!(key_pair.is_valid());
    }
}
