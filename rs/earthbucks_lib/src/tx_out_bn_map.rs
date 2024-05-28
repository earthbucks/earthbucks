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

    pub fn name_from_output(tx_id: &[u8], tx_out_num: u32) -> String {
        format!("{}:{}", hex::encode(tx_id), tx_out_num)
    }

    pub fn name_to_tx_id(name: &str) -> Vec<u8> {
        hex::decode(name.split(':').next().unwrap()).unwrap()
    }

    pub fn name_to_tx_out_num(name: &str) -> u32 {
        name.split(':').nth(1).unwrap().parse().unwrap()
    }

    pub fn add(&mut self, tx_id: &[u8], tx_out_num: u32, tx_out: TxOut, block_num: u64) {
        let name = Self::name_from_output(tx_id, tx_out_num);
        let tx_out_bn = TxOutBn {
            tx_out: tx_out.clone(),
            block_num,
        };
        self.map.insert(name, tx_out_bn);
    }

    pub fn remove(&mut self, tx_id: &[u8], tx_out_num: u32) {
        let name = Self::name_from_output(tx_id, tx_out_num);
        self.map.remove(&name);
    }

    pub fn get(&self, tx_id: &[u8], tx_out_num: u32) -> Option<&TxOutBn> {
        let name = Self::name_from_output(tx_id, tx_out_num);
        self.map.get(&name)
    }

    pub fn values(&self) -> Vec<&TxOutBn> {
        self.map.values().collect()
    }

    pub fn add_tx_outputs(&mut self, tx: &Tx, block_num: u64) {
        for (output_index, output) in tx.outputs.iter().enumerate() {
            self.add(&tx.id(), output_index as u32, output.clone(), block_num);
        }
    }
}
