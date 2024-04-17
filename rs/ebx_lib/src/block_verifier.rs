use crate::block::Block;
use crate::domain::Domain;
use crate::header_chain::HeaderChain;
use crate::merkle_txs::MerkleTxs;
use crate::script_num::ScriptNum;
use crate::tx_output_map::TxOutputMap;
use crate::tx_verifier::TxVerifier;
use num_bigint::BigInt;

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

    pub fn has_valid_coinbase(&self) -> bool {
        // 1. coinbase tx is first tx
        let txs = &self.block.txs;
        if txs.len() == 0 {
            return false;
        }
        let coinbase_tx = &txs[0];
        if !coinbase_tx.is_coinbase() {
            return false;
        }
        // 2. coinbase script is valid (push only)
        let coinbase_input = &coinbase_tx.inputs[0];
        let coinbase_script = &coinbase_input.script;
        if !coinbase_script.is_push_only() {
            return false;
        }
        // 3. block number at the top of the stack is correct
        let script_chunks = &coinbase_script.chunks;
        let chunks_len = script_chunks.len();
        if chunks_len < 2 {
            return false;
        }
        let block_num_chunk = &script_chunks[chunks_len - 1];
        let block_num = ScriptNum::from_u8_vec(&block_num_chunk.buffer.clone().unwrap());
        if BigInt::from(self.block.header.block_num) != block_num.num {
            return false;
        }
        // 4. domain name, second to top, of stack is valid
        let domain_chunk = &script_chunks[chunks_len - 2];
        let domain_buf = domain_chunk.buffer.clone().unwrap();
        let res_domain_str = String::from_utf8(domain_buf);
        if res_domain_str.is_err() {
            return false;
        }
        let domain_str = res_domain_str.unwrap();
        if !Domain::is_valid_domain(&domain_str) {
            return false;
        }
        // 5. all outputs are pkh
        for tx_output in &coinbase_tx.outputs {
            if !tx_output.script.is_pkh_output() {
                return false;
            }
        }
        // note that we do not verify whether domain is actually correct, rather
        // only that it is a valid domain. that would require pinging the domain
        // name, which is done elsewhere.
        true
    }

    pub fn txs_are_valid(&mut self) -> bool {
        if !self.has_valid_coinbase() {
            return false;
        }
        let txs = &self.block.txs[1..];
        // iterate through all transactions except the first (coinbase tx)
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
