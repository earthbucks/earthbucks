use crate::buf::EbxBuf;
use crate::tx::Tx;
use crate::tx_out::TxOut;
use crate::tx_out_bn::TxOutBn;
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct TxOutBnMap {
    pub map: HashMap<String, TxOutBn>,
}

impl TxOutBnMap {
    pub fn new() -> Self {
        Self {
            map: HashMap::new(),
        }
    }

    pub fn name_from_output(tx_id: &[u8; 32], tx_out_num: u32) -> String {
        format!("{}:{}", tx_id.to_strict_hex(), tx_out_num)
    }

    pub fn name_to_tx_id(name: &str) -> Vec<u8> {
        Vec::<u8>::from_strict_hex(name.split(':').next().unwrap()).unwrap()
    }

    pub fn name_to_tx_out_num(name: &str) -> u32 {
        name.split(':').nth(1).unwrap().parse().unwrap()
    }

    pub fn add(&mut self, tx_id: &[u8; 32], tx_out_num: u32, tx_out: TxOut, block_num: u32) {
        let name = Self::name_from_output(tx_id, tx_out_num);
        let tx_out_bn = TxOutBn {
            tx_out: tx_out.clone(),
            block_num,
        };
        self.map.insert(name, tx_out_bn);
    }

    pub fn remove(&mut self, tx_id: &[u8; 32], tx_out_num: u32) {
        let name = Self::name_from_output(tx_id, tx_out_num);
        self.map.remove(&name);
    }

    pub fn get(&self, tx_id: &[u8; 32], tx_out_num: u32) -> Option<&TxOutBn> {
        let name = Self::name_from_output(tx_id, tx_out_num);
        self.map.get(&name)
    }

    pub fn values(&self) -> Vec<&TxOutBn> {
        self.map.values().collect()
    }

    pub fn add_tx_outputs(&mut self, tx: &Tx, block_num: u32) {
        for (output_index, output) in tx.outputs.iter().enumerate() {
            self.add(&tx.id(), output_index as u32, output.clone(), block_num);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn name_from_output() {
        let tx_id_hash = [
            1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let output_index = 0;
        let name = TxOutBnMap::name_from_output(&tx_id_hash, output_index);
        assert_eq!(
            name,
            "0102030400000000000000000000000000000000000000000000000000000000:0"
        );
    }

    #[test]
    fn add() {
        let mut tx_out_map = TxOutBnMap::new();
        let tx_output = TxOut::new(100, Script::from_empty());
        let tx_id_hash = [
            1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let output_index = 0;
        let block_num: u32 = 0;
        let tx_out_bn = TxOutBn {
            tx_out: tx_output.clone(),
            block_num,
        };
        tx_out_map.add(&tx_id_hash, output_index, tx_output.clone(), block_num);
        assert_eq!(
            tx_out_map.get(&tx_id_hash, output_index).unwrap(),
            &tx_out_bn
        );
    }

    #[test]
    fn remove() {
        let mut tx_out_map = TxOutBnMap::new();
        let tx_output = TxOut::new(100, Script::from_empty());
        let tx_id_hash = [
            1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let output_index = 0;
        let block_num = 0;
        tx_out_map.add(&tx_id_hash, output_index, tx_output, block_num);
        tx_out_map.remove(&tx_id_hash, output_index);
        assert_eq!(tx_out_map.get(&tx_id_hash, output_index), None);
    }

    #[test]
    fn get() {
        let mut tx_out_map = TxOutBnMap::new();
        let tx_output = TxOut::new(100, Script::from_empty());
        let tx_id_hash = [
            1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let output_index = 0;
        let block_num = 0;
        let tx_out_bn = TxOutBn {
            tx_out: tx_output.clone(),
            block_num,
        };
        tx_out_map.add(&tx_id_hash, output_index, tx_output.clone(), block_num);
        let retrieved = tx_out_map.get(&tx_id_hash, output_index);
        assert_eq!(retrieved, Some(&tx_out_bn));
    }

    #[test]
    fn test_values() {
        let mut tx_out_map = TxOutBnMap::new();
        let tx_out1 = TxOut::new(100, Script::from_empty());
        let tx_out2 = TxOut::new(200, Script::from_empty());
        let tx_id_hash1 = [
            1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let tx_id_hash2 = [
            5, 6, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
        ];
        let output_index = 0;
        let block_num = 0;
        let tx_out_bn1 = TxOutBn {
            tx_out: tx_out1.clone(),
            block_num,
        };
        let tx_out_bn2 = TxOutBn {
            tx_out: tx_out2.clone(),
            block_num,
        };
        tx_out_map.add(&tx_id_hash1, output_index, tx_out1.clone(), block_num);
        tx_out_map.add(&tx_id_hash2, output_index, tx_out2.clone(), block_num);
        let values: Vec<&TxOutBn> = tx_out_map.values();
        assert_eq!(values.len(), 2);
        assert!(values.contains(&&tx_out_bn1));
        assert!(values.contains(&&tx_out_bn2));
    }
}
