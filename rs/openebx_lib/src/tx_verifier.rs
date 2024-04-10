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

    pub fn verify_input_script(&mut self, n_in: usize) -> bool {
        let tx_input = &self.tx.inputs[n_in];
        let tx_out_hash = &tx_input.input_tx_id;
        let output_index = tx_input.input_tx_out_num;
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

    pub fn verify_scripts(&mut self) -> bool {
        for i in 0..self.tx.inputs.len() {
            if !self.verify_input_script(i) {
                return false;
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
            let tx_out = self
                .tx_out_map
                .get(&input.input_tx_id, input.input_tx_out_num);
            match tx_out {
                None => return false,
                Some(tx_out) => total_input_value += tx_out.value,
            }
        }
        total_input_value == total_output_value
    }

    pub fn verify(&mut self) -> bool {
        if !self.verify_scripts() {
            return false;
        }
        if !self.verify_output_values() {
            return false;
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use crate::address::Address;
    use crate::address_key_map::AddressKeyMap;
    use crate::key::Key;
    use crate::script::Script;
    use crate::tx_builder::TxBuilder;
    use crate::tx_output::TxOutput;
    use crate::tx_output_map::TxOutputMap;
    use crate::tx_signer::TxSigner;

    use super::*;

    #[test]
    fn should_sign_and_verify_a_tx() {
        let mut tx_out_map = TxOutputMap::new();
        let mut address_key_map = AddressKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = Key::from_random();
            let address = Address::new(key.clone().public_key);
            address_key_map.add(key, &address.address);
            let script = Script::from_address_output(&address.address);
            let output = TxOutput::new(100, script);
            tx_out_map.add(output, &vec![0; 32], i);
        }

        let change_script = Script::from_string("").unwrap();
        let mut tx_builder = TxBuilder::new(&tx_out_map, change_script);

        tx_builder.add_output(50, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_map, &address_key_map);
        let signed = tx_signer.sign(0);
        let signed_tx = tx_signer.tx;
        assert_eq!(signed, true);

        let mut tx_verifier = TxVerifier::new(signed_tx, tx_out_map);
        let verified_input = tx_verifier.verify_input_script(0);
        assert_eq!(verified_input, true);

        let verified_scripts = tx_verifier.verify_scripts();
        assert_eq!(verified_scripts, true);

        let verified_output_values = tx_verifier.verify_output_values();
        assert_eq!(verified_output_values, true);

        let verified = tx_verifier.verify();
        assert_eq!(verified, true);
    }

    #[test]
    fn should_sign_and_verify_a_tx_with_two_inputs() {
        let mut tx_out_map = TxOutputMap::new();
        let mut address_key_map = AddressKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = Key::from_random();
            let address = Address::new(key.clone().public_key);
            address_key_map.add(key, &address.address);
            let script = Script::from_address_output(&address.address);
            let output = TxOutput::new(100, script);
            tx_out_map.add(output, &vec![0; 32], i);
        }

        let change_script = Script::from_string("").unwrap();
        let mut tx_builder = TxBuilder::new(&tx_out_map, change_script);

        tx_builder.add_output(100, Script::from_string("").unwrap());
        tx_builder.add_output(100, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 2);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 100);
        assert_eq!(tx.outputs[1].value, 100);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_map, &address_key_map);
        let signed1 = tx_signer.sign(0);
        assert_eq!(signed1, true);
        let signed2 = tx_signer.sign(1);
        assert_eq!(signed2, true);
        let signed_tx = tx_signer.tx;

        let mut tx_verifier = TxVerifier::new(signed_tx, tx_out_map);
        let verified_input1 = tx_verifier.verify_input_script(0);
        assert_eq!(verified_input1, true);
        let verified_input2 = tx_verifier.verify_input_script(1);
        assert_eq!(verified_input2, true);

        let verified_scripts = tx_verifier.verify_scripts();
        assert_eq!(verified_scripts, true);

        let verified_output_values = tx_verifier.verify_output_values();
        assert_eq!(verified_output_values, true);

        let verified = tx_verifier.verify();
        assert_eq!(verified, true);
    }
}
