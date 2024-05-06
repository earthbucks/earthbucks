use crate::tx::Tx;
use crate::tx_output::TxOutput;
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct TxOutputMap {
    pub map: HashMap<String, TxOutput>,
}

impl TxOutputMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn name_from_output(tx_id_hash: &[u8], output_index: u32) -> String {
        format!("{}:{}", hex::encode(tx_id_hash), output_index)
    }

    pub fn name_to_tx_id_hash(name: &str) -> Vec<u8> {
        hex::decode(name.split(':').next().unwrap()).unwrap()
    }

    pub fn name_to_output_index(name: &str) -> u32 {
        name.split(':').nth(1).unwrap().parse().unwrap()
    }

    pub fn add(&mut self, output: TxOutput, tx_id_hash: &[u8], output_index: u32) {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.insert(name, output);
    }

    pub fn remove(&mut self, tx_id_hash: &[u8], output_index: u32) {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.remove(&name);
    }

    pub fn get(&self, tx_id_hash: &[u8], output_index: u32) -> Option<&TxOutput> {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.get(&name)
    }

    pub fn values(&self) -> Vec<&TxOutput> {
        self.map.values().collect()
    }

    pub fn add_tx_outputs(&mut self, tx: &Tx) {
        for (output_index, output) in tx.outputs.iter().enumerate() {
            self.add(output.clone(), &tx.id(), output_index as u32);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn name_from_output() {
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        let name = TxOutputMap::name_from_output(&tx_id_hash, output_index);
        assert_eq!(name, "01020304:0");
    }

    #[test]
    fn add() {
        let mut tx_output_map = TxOutputMap::new();
        let tx_output = TxOutput::new(100, Script::from_iso_str("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        tx_output_map.add(tx_output.clone(), &tx_id_hash, output_index);
        assert_eq!(
            tx_output_map.get(&tx_id_hash, output_index),
            Some(&tx_output)
        );
    }

    #[test]
    fn remove() {
        let mut tx_output_map = TxOutputMap::new();
        let tx_output = TxOutput::new(100, Script::from_iso_str("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        tx_output_map.add(tx_output, &tx_id_hash, output_index);
        tx_output_map.remove(&tx_id_hash, output_index);
        assert_eq!(tx_output_map.get(&tx_id_hash, output_index), None);
    }

    #[test]
    fn get() {
        let mut tx_output_map = TxOutputMap::new();
        let tx_output = TxOutput::new(100, Script::from_iso_str("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        tx_output_map.add(tx_output.clone(), &tx_id_hash, output_index);
        let retrieved_output = tx_output_map.get(&tx_id_hash, output_index);
        assert_eq!(retrieved_output, Some(&tx_output));
    }

    #[test]
    fn test_values() {
        let mut tx_output_map = TxOutputMap::new();
        let tx_output1 = TxOutput::new(100, Script::from_iso_str("").unwrap());
        let tx_output2 = TxOutput::new(200, Script::from_iso_str("").unwrap());
        let tx_id_hash1 = [1, 2, 3, 4];
        let tx_id_hash2 = [5, 6, 7, 8];
        let output_index = 0;
        tx_output_map.add(tx_output1.clone(), &tx_id_hash1, output_index);
        tx_output_map.add(tx_output2.clone(), &tx_id_hash2, output_index);
        let values: Vec<&TxOutput> = tx_output_map.values();
        assert_eq!(values.len(), 2);
        assert!(values.contains(&&tx_output1));
        assert!(values.contains(&&tx_output2));
    }
}
