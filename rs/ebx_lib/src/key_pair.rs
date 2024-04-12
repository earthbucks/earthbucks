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
    pub fn new(priv_key: [u8; 32]) -> Self {
        let priv_key = PrivKey::new(priv_key);
        let pub_key = PubKey::from_priv_key(&priv_key);
        KeyPair { priv_key, pub_key }
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Self {
        let pub_key = PubKey::from_priv_key(priv_key);
        KeyPair {
            priv_key: priv_key.clone(),
            pub_key,
        }
    }

    pub fn from_random() -> Self {
        let priv_key = PrivKey::from_random();
        KeyPair::from_priv_key(&priv_key)
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

    pub fn from_u8_vec(vec: Vec<u8>) -> Result<Self, String> {
        if vec.len() != 65 {
            return Err("Invalid buffer length".to_string());
        }
        let mut buffer = [0u8; 65];
        buffer.copy_from_slice(&vec);
        Ok(KeyPair::from_buffer(&buffer))
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.to_buffer())
    }

    pub fn from_hex(hex: &str) -> Result<Self, String> {
        let buffer = Buffer::from_hex(hex).data;
        if buffer.len() != 65 {
            return Err("Invalid buffer length".to_string());
        }
        let buffer: [u8; 65] = buffer.try_into().unwrap();
        Ok(KeyPair::from_buffer(&buffer))
    }

    pub fn to_string(&self) -> String {
        self.to_hex()
    }

    pub fn from_string(s: &str) -> Result<Self, String> {
        KeyPair::from_hex(s)
    }
}

// standard test vectors: key.json
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
        let data = fs::read_to_string("../../json/key.json").expect("Unable to read file");
        let key_pairs: JsonKeyPairs = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in key_pairs.key_pair {
            let priv_key: PrivKey = PrivKey::from_string(&pair.priv_key).unwrap();
            let key_pair = KeyPair::from_priv_key(&priv_key);
            let pub_key = key_pair.pub_key;

            let expected_public_key = &pair.pub_key;
            let actual_public_key = pub_key.to_hex();

            assert_eq!(expected_public_key, &actual_public_key);
        }
    }
}
