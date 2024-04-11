use crate::key::Key;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct PkhKeyMap {
    map: HashMap<String, Key>,
}

impl PkhKeyMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn add(&mut self, key: Key, pkh_u8_vec: &[u8]) {
        let pkh_hex = hex::encode(pkh_u8_vec);
        self.map.insert(pkh_hex, key);
    }

    pub fn remove(&mut self, pkh_u8_vec: &[u8]) {
        let pkh_hex = hex::encode(pkh_u8_vec);
        self.map.remove(&pkh_hex);
    }

    pub fn get(&self, pkh_u8_vec: &[u8]) -> Option<&Key> {
        let pkh_hex = hex::encode(pkh_u8_vec);
        self.map.get(&pkh_hex)
    }

    pub fn values(&self) -> std::collections::hash_map::Values<'_, String, Key> {
        self.map.values()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key::Key;
    use crate::pkh::Pkh;
    use hex;

    #[test]
    fn test_add() {
        let mut pkh_key_map = PkhKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pkh = Pkh::new(key_clone.public_key);
        let pkh_u8_vec = pkh.pkh;
        pkh_key_map.add(key.clone(), &pkh_u8_vec);
        let retrieved_key = pkh_key_map.get(&pkh_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_remove() {
        let mut pkh_key_map = PkhKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pkh = Pkh::new(key_clone.public_key);
        let pkh_u8_vec = pkh.pkh;
        pkh_key_map.add(key.clone(), &pkh_u8_vec);
        pkh_key_map.remove(&pkh_u8_vec);
        assert!(pkh_key_map.get(&pkh_u8_vec).is_none());
    }

    #[test]
    fn test_get() {
        let mut pkh_key_map = PkhKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let pkh = Pkh::new(key_clone.public_key);
        let pkh_u8_vec = pkh.pkh;
        pkh_key_map.add(key.clone(), &pkh_u8_vec);
        let retrieved_key = pkh_key_map.get(&pkh_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_values() {
        let mut pkh_key_map = PkhKeyMap::new();
        let key1 = Key::from_random();
        let key1_clone = key1.clone();
        let pkh1 = Pkh::new(key1_clone.public_key);
        let pkh_u8_vec1 = pkh1.pkh;
        let key2 = Key::from_random();
        let key2_clone = key2.clone();
        let pkh2 = Pkh::new(key2_clone.public_key);
        let pkh_u8_vec2 = pkh2.pkh;
        pkh_key_map.add(key1.clone(), &pkh_u8_vec1);
        pkh_key_map.add(key2.clone(), &pkh_u8_vec2);
        let values: Vec<&Key> = pkh_key_map.values().collect();
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
