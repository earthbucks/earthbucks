use crate::key_pair::KeyPair;
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct PkhKeyMap {
    map: HashMap<String, KeyPair>,
}

impl PkhKeyMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn add(&mut self, key: KeyPair, pkh_iso_buf: &[u8]) {
        let pkh_hex = hex::encode(pkh_iso_buf);
        self.map.insert(pkh_hex, key);
    }

    pub fn remove(&mut self, pkh_iso_buf: &[u8]) {
        let pkh_hex = hex::encode(pkh_iso_buf);
        self.map.remove(&pkh_hex);
    }

    pub fn get(&self, pkh_iso_buf: &[u8]) -> Option<&KeyPair> {
        let pkh_hex = hex::encode(pkh_iso_buf);
        self.map.get(&pkh_hex)
    }

    pub fn values(&self) -> std::collections::hash_map::Values<'_, String, KeyPair> {
        self.map.values()
    }
}
