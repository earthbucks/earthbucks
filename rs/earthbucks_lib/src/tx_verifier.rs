use crate::script_interpreter::ScriptInterpreter;
use crate::tx::{HashCache, Tx};
use crate::tx_output_map::TxOutputMap;

pub struct TxVerifier {
    tx: Tx,
    tx_out_map: TxOutputMap,
    hash_cache: HashCache,
}

impl TxVerifier {
    pub fn new(tx: Tx, tx_out_map: TxOutputMap) -> Self {
        let hash_cache = HashCache::new();
        Self {
            tx,
            tx_out_map,
            hash_cache,
        }
    }

    pub fn verify_input(&mut self, n_in: usize) -> bool {
        let tx_input = &self.tx.inputs[n_in];
        let tx_out_hash = &tx_input.input_tx_id;
        let output_index = tx_input.input_tx_index;
        let tx_out = self.tx_out_map.get(tx_out_hash, output_index);
        match tx_out {
            None => return false,
            Some(tx_out) => {
                let output_script = &tx_out.script;
                let input_script = &tx_input.script;
                if !input_script.is_push_only() {
                    return false;
                }
                let stack: Vec<Vec<u8>> = input_script
                    .chunks
                    .iter()
                    .map(|chunk| chunk.buffer.clone().unwrap_or_else(Vec::new))
                    .collect();
                let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
                    output_script.clone(),
                    self.tx.clone(),
                    n_in,
                    stack,
                    tx_out.value,
                    &mut self.hash_cache,
                );
                let result = script_interpreter.eval_script();
                return result;
            }
        }
    }

    pub fn verify(&mut self) -> bool {
        for i in 0..self.tx.inputs.len() {
            if !self.verify_input(i) {
                return false;
            }
        }
        true
    }
}
