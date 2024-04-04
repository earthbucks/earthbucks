use crate::key::Key;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PubKeyHashKeyMap {
    map: HashMap<String, Key>,
}

impl PubKeyHashKeyMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn add(&mut self, key: Key, pub_key_hash_u8_vec: &[u8]) {
        let pub_key_hash_hex = hex::encode(pub_key_hash_u8_vec);
        self.map.insert(pub_key_hash_hex, key);
    }

    pub fn remove(&mut self, pub_key_hash_u8_vec: &[u8]) {
        let pub_key_hash_hex = hex::encode(pub_key_hash_u8_vec);
        self.map.remove(&pub_key_hash_hex);
    }

    pub fn get(&self, pub_key_hash_u8_vec: &[u8]) -> Option<&Key> {
        let pub_key_hash_hex = hex::encode(pub_key_hash_u8_vec);
        self.map.get(&pub_key_hash_hex)
    }

    pub fn values(&self) -> std::collections::hash_map::Values<'_, String, Key> {
        self.map.values()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key::Key;
    use crate::pub_key_hash::PubKeyHash;
    use hex;

    #[test]
    fn test_add() {
        let mut pub_key_hash_key_map = PubKeyHashKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pub_key_hash = PubKeyHash::new(key_clone.public_key);
        let pub_key_hash_u8_vec = pub_key_hash.pub_key_hash;
        pub_key_hash_key_map.add(key.clone(), &pub_key_hash_u8_vec);
        let retrieved_key = pub_key_hash_key_map.get(&pub_key_hash_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_remove() {
        let mut pub_key_hash_key_map = PubKeyHashKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pub_key_hash = PubKeyHash::new(key_clone.public_key);
        let pub_key_hash_u8_vec = pub_key_hash.pub_key_hash;
        pub_key_hash_key_map.add(key.clone(), &pub_key_hash_u8_vec);
        pub_key_hash_key_map.remove(&pub_key_hash_u8_vec);
        assert!(pub_key_hash_key_map.get(&pub_key_hash_u8_vec).is_none());
    }

    #[test]
    fn test_get() {
        let mut pub_key_hash_key_map = PubKeyHashKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pub_key_hash = PubKeyHash::new(key_clone.public_key);
        let pub_key_hash_u8_vec = pub_key_hash.pub_key_hash;
        pub_key_hash_key_map.add(key.clone(), &pub_key_hash_u8_vec);
        let retrieved_key = pub_key_hash_key_map.get(&pub_key_hash_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_values() {
        let mut pub_key_hash_key_map = PubKeyHashKeyMap::new();
        let key1 = Key::from_random();
        let key1_clone = key1.clone();
        let pub_key_hash1 = PubKeyHash::new(key1_clone.public_key);
        let pub_key_hash_u8_vec1 = pub_key_hash1.pub_key_hash;
        let key2 = Key::from_random();
        let key2_clone = key2.clone();
        let pub_key_hash2 = PubKeyHash::new(key2_clone.public_key);
        let pub_key_hash_u8_vec2 = pub_key_hash2.pub_key_hash;
        pub_key_hash_key_map.add(key1.clone(), &pub_key_hash_u8_vec1);
        pub_key_hash_key_map.add(key2.clone(), &pub_key_hash_u8_vec2);
        let values: Vec<&Key> = pub_key_hash_key_map.values().collect();
        assert_eq!(values.len(), 2);

        let key1_encoded = hex::encode(&key1.private_key);
        let key2_encoded = hex::encode(&key2.private_key);
        let values_encoded: Vec<String> = values
            .iter()
            .map(|value| hex::encode(&value.private_key))
            .collect();

        assert!(values_encoded.contains(&key1_encoded));
        assert!(values_encoded.contains(&key2_encoded));
    }
}
