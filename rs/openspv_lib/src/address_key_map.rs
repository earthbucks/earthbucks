use crate::key::Key;
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct AddressKeyMap {
    map: HashMap<String, Key>,
}

impl AddressKeyMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn add(&mut self, key: Key, address_u8_vec: &[u8]) {
        let address_hex = hex::encode(address_u8_vec);
        self.map.insert(address_hex, key);
    }

    pub fn remove(&mut self, address_u8_vec: &[u8]) {
        let address_hex = hex::encode(address_u8_vec);
        self.map.remove(&address_hex);
    }

    pub fn get(&self, address_u8_vec: &[u8]) -> Option<&Key> {
        let address_hex = hex::encode(address_u8_vec);
        self.map.get(&address_hex)
    }

    pub fn values(&self) -> std::collections::hash_map::Values<'_, String, Key> {
        self.map.values()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::address::Address;
    use crate::key::Key;
    use hex;

    #[test]
    fn test_add() {
        let mut address_key_map = AddressKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let address = Address::new(key_clone.public_key);
        let address_u8_vec = address.address;
        address_key_map.add(key.clone(), &address_u8_vec);
        let retrieved_key = address_key_map.get(&address_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_remove() {
        let mut address_key_map = AddressKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let address = Address::new(key_clone.public_key);
        let address_u8_vec = address.address;
        address_key_map.add(key.clone(), &address_u8_vec);
        address_key_map.remove(&address_u8_vec);
        assert!(address_key_map.get(&address_u8_vec).is_none());
    }

    #[test]
    fn test_get() {
        let mut address_key_map = AddressKeyMap::new();
        let key = Key::from_random();
        let key_clone = key.clone();
        let address = Address::new(key_clone.public_key);
        let address_u8_vec = address.address;
        address_key_map.add(key.clone(), &address_u8_vec);
        let retrieved_key = address_key_map.get(&address_u8_vec).unwrap();
        assert_eq!(
            hex::encode(&retrieved_key.private_key),
            hex::encode(&key.private_key)
        );
    }

    #[test]
    fn test_values() {
        let mut address_key_map = AddressKeyMap::new();
        let key1 = Key::from_random();
        let key1_clone = key1.clone();
        let address1 = Address::new(key1_clone.public_key);
        let address_u8_vec1 = address1.address;
        let key2 = Key::from_random();
        let key2_clone = key2.clone();
        let address2 = Address::new(key2_clone.public_key);
        let address_u8_vec2 = address2.address;
        address_key_map.add(key1.clone(), &address_u8_vec1);
        address_key_map.add(key2.clone(), &address_u8_vec2);
        let values: Vec<&Key> = address_key_map.values().collect();
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
