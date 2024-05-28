use crate::script_interpreter::ScriptInterpreter;
use crate::tx::{HashCache, Tx};
use crate::tx_out_bn_map::TxOutBnMap;

pub struct TxVerifier<'a> {
    tx: Tx,
    tx_out_bn_map: &'a TxOutBnMap,
    hash_cache: HashCache,
    block_num: u64,
}

impl<'a> TxVerifier<'a> {
    pub fn new(tx: Tx, tx_out_bn_map: &'a TxOutBnMap, block_num: u64) -> Self {
        let hash_cache = HashCache::new();
        Self {
            tx,
            tx_out_bn_map,
            hash_cache,
            block_num,
        }
    }

    pub fn verify_input_script(&mut self, n_in: usize) -> bool {
        let tx_input = &self.tx.inputs[n_in];
        let tx_out_hash = &tx_input.input_tx_id;
        let output_index = tx_input.input_tx_out_num;
        let tx_out = self.tx_out_bn_map.get(tx_out_hash, output_index);
        match tx_out {
            None => false,
            Some(tx_out_bn) => {
                let output_script = &tx_out_bn.tx_out.script;
                let input_script = &tx_input.script;
                if !input_script.is_push_only() {
                    return false;
                }
                let stack: Vec<Vec<u8>> = input_script
                    .chunks
                    .iter()
                    .map(|chunk| chunk.get_data().unwrap())
                    .collect();
                let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                    output_script.clone(),
                    self.tx.clone(),
                    n_in,
                    stack,
                    tx_out_bn.tx_out.value,
                    &mut self.hash_cache,
                );
                script_interpreter.eval_script()
            }
        }
    }

    pub fn verify_input_lock_rel(&mut self, n_in: usize) -> bool {
        let tx_input = &self.tx.inputs[n_in];
        let tx_id = &tx_input.input_tx_id;
        let tx_out_num = tx_input.input_tx_out_num;
        let tx_out = self.tx_out_bn_map.get(tx_id, tx_out_num);
        match tx_out {
            None => false,
            Some(tx_out_bn) => {
                let lock_rel: u64 = tx_input.lock_rel as u64;
                let prev_block_num = tx_out_bn.block_num;
                self.block_num >= prev_block_num + lock_rel
            }
        }
    }

    pub fn verify_inputs(&mut self) -> bool {
        for i in 0..self.tx.inputs.len() {
            if !self.verify_input_script(i) {
                return false;
            }
            if !self.verify_input_lock_rel(i) {
                return false;
            }
        }
        true
    }

    pub fn verify_no_double_spend(&self) -> bool {
        let mut spent_outputs = Vec::new();
        for input in &self.tx.inputs {
            let tx_out = self
                .tx_out_bn_map
                .get(&input.input_tx_id, input.input_tx_out_num);
            match tx_out {
                None => return false,
                Some(tx_out) => {
                    if spent_outputs.contains(&tx_out) {
                        return false;
                    }
                    spent_outputs.push(tx_out);
                }
            }
        }
        true
    }

    pub fn verify_output_values(&self) -> bool {
        let mut total_output_value = 0;
        for output in &self.tx.outputs {
            total_output_value += output.value;
        }
        let mut total_input_value = 0;
        for input in &self.tx.inputs {
            let tx_out_bn = self
                .tx_out_bn_map
                .get(&input.input_tx_id, input.input_tx_out_num);
            match tx_out_bn {
                None => return false,
                Some(tx_out_bn) => total_input_value += tx_out_bn.tx_out.value,
            }
        }
        total_input_value == total_output_value
    }

    pub fn verify_is_not_coinbase(&self) -> bool {
        // TODO: Allow coinbases to have multiple inputs
        if self.tx.inputs.len() == 1 && self.tx.inputs[0].is_coinbase() {
            return false;
        }
        true
    }

    pub fn verify_lock_abs(&self) -> bool {
        if self.tx.lock_abs > self.block_num {
            return false;
        }
        true
    }

    pub fn verify(&mut self) -> bool {
        if !self.verify_lock_abs() {
            return false;
        }
        if !self.verify_is_not_coinbase() {
            return false;
        }
        if !self.verify_no_double_spend() {
            return false;
        }
        if !self.verify_inputs() {
            return false;
        }
        if !self.verify_output_values() {
            return false;
        }
        true
    }
}
