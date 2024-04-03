use crate::transaction_output::TransactionOutput;
use std::collections::HashMap;

pub struct TransactionOutputMap {
    map: HashMap<String, TransactionOutput>,
}

impl TransactionOutputMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn name_from_output(tx_id_hash: &[u8], output_index: u32) -> String {
        format!("{}:{}", hex::encode(tx_id_hash), output_index)
    }

    pub fn add(&mut self, output: TransactionOutput, tx_id_hash: &[u8], output_index: u32) {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.insert(name, output);
    }

    pub fn remove(&mut self, tx_id_hash: &[u8], output_index: u32) {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.remove(&name);
    }

    pub fn get(&self, tx_id_hash: &[u8], output_index: u32) -> Option<&TransactionOutput> {
        let name = Self::name_from_output(tx_id_hash, output_index);
        self.map.get(&name)
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
        let name = TransactionOutputMap::name_from_output(&tx_id_hash, output_index);
        assert_eq!(name, "01020304:0");
    }

    #[test]
    fn add() {
        let mut transaction_output_map = TransactionOutputMap::new();
        let transaction_output = TransactionOutput::new(100, Script::from_string("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        transaction_output_map.add(transaction_output.clone(), &tx_id_hash, output_index);
        assert_eq!(
            transaction_output_map.get(&tx_id_hash, output_index),
            Some(&transaction_output)
        );
    }

    #[test]
    fn remove() {
        let mut transaction_output_map = TransactionOutputMap::new();
        let transaction_output = TransactionOutput::new(100, Script::from_string("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        transaction_output_map.add(transaction_output, &tx_id_hash, output_index);
        transaction_output_map.remove(&tx_id_hash, output_index);
        assert_eq!(transaction_output_map.get(&tx_id_hash, output_index), None);
    }

    #[test]
    fn get() {
        let mut transaction_output_map = TransactionOutputMap::new();
        let transaction_output = TransactionOutput::new(100, Script::from_string("").unwrap());
        let tx_id_hash = [1, 2, 3, 4];
        let output_index = 0;
        transaction_output_map.add(transaction_output.clone(), &tx_id_hash, output_index);
        let retrieved_output = transaction_output_map.get(&tx_id_hash, output_index);
        assert_eq!(retrieved_output, Some(&transaction_output));
    }
}
