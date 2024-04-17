use crate::block::Block;
use crate::header_chain::HeaderChain;
use crate::merkle_txs::MerkleTxs;
use crate::tx_output_map::TxOutputMap;
use crate::tx_verifier::TxVerifier;

pub struct BlockVerifier {
    pub block: Block,
    pub tx_output_map: TxOutputMap, // from earlier blocks
    pub lch: HeaderChain,           // longest chain
}

impl BlockVerifier {
    pub fn new(block: Block, tx_output_map: TxOutputMap, lch: HeaderChain) -> Self {
        Self {
            block,
            tx_output_map,
            lch,
        }
    }

    pub fn header_is_valid_at_timestamp(&mut self, timestamp: u64) -> bool {
        let header = &self.block.header;
        let lch = &self.lch;
        lch.new_header_is_valid_at(header, timestamp)
    }

    pub fn merkle_root_is_valid(&self) -> bool {
        let txs = &self.block.txs;
        let merkle_root = self.block.header.merkle_root;
        // TODO: Eliminate clone of txs
        let merkle_txs = MerkleTxs::new(txs.clone());
        merkle_txs.root == merkle_root
    }

    pub fn txs_are_valid(&mut self) -> bool {
        let txs = &self.block.txs;
        if txs.len() == 0 {
            return false;
        }
        let tx1 = &txs[0];
        if !tx1.is_coinbase() {
            return false;
        }
        // iterate through all transactions
        // if invalid, return false
        // if valid, add outputs to tx_output_map and remove used outputs
        for tx in txs {
            let mut tx_verifier = TxVerifier::new(tx.clone(), &self.tx_output_map);
            if !tx_verifier.verify() {
                return false;
            }
            self.tx_output_map.add_tx_outputs(tx);
            // remove used outputs to prevent double spending
            for tx_input in &tx.inputs {
                self.tx_output_map
                    .remove(&tx_input.input_tx_id, tx_input.input_tx_out_num);
            }
        }
        true
    }

    pub fn is_valid_at_timestamp(&mut self, timestamp: u64) -> bool {
        if timestamp < self.block.header.timestamp {
            return false;
        }
        if !self.header_is_valid_at_timestamp(timestamp) {
            return false;
        }
        if !self.merkle_root_is_valid() {
            return false;
        }
        if !self.txs_are_valid() {
            return false;
        }
        true
    }
}
