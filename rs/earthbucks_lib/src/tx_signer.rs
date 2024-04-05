use crate::address_key_map::AddressKeyMap;
use crate::tx::Tx;
use crate::tx_output_map::TxOutputMap;
use crate::tx_signature::TxSignature;

pub struct TxSigner {
    pub tx: Tx,
    pub address_key_map: AddressKeyMap,
    pub tx_out_map: TxOutputMap,
}

impl TxSigner {
    pub fn new(tx: Tx, tx_out_map: &TxOutputMap, address_key_map: &AddressKeyMap) -> Self {
        Self {
            tx,
            tx_out_map: tx_out_map.clone(),
            address_key_map: address_key_map.clone(),
        }
    }

    pub fn sign(&mut self, n_in: usize) -> bool {
        let mut tx_clone = self.tx.clone();
        let tx_input = &mut tx_clone.inputs[n_in];
        let tx_out_hash = &tx_input.input_tx_id;
        let output_index = tx_input.input_tx_index;
        let tx_out = match self.tx_out_map.get(&tx_out_hash, output_index) {
            Some(tx_out) => tx_out,
            None => return false,
        };
        if !tx_out.script.is_address_output() {
            return false;
        }
        let address = match &tx_out.script.chunks[2].buffer {
            Some(address) => address,
            None => return false,
        };
        let input_script = &mut tx_input.script;
        if !input_script.is_address_input() {
            return false;
        }
        let key = match self.address_key_map.get(address) {
            Some(key) => key,
            None => return false,
        };
        let pub_key = &key.public_key;
        if pub_key.len() != 33 {
            return false;
        }
        input_script.chunks[1].buffer = Some(pub_key.clone());
        let output_script_buf = tx_out.script.to_u8_vec();
        let output_amount = tx_out.value;
        let private_key_array = match key.private_key.as_slice().try_into() {
            Ok(array) => array,
            Err(_e) => return false,
        };
        let sig = self.tx.sign(
            n_in,
            private_key_array,
            output_script_buf.to_vec(),
            output_amount,
            TxSignature::SIGHASH_ALL,
        );
        let sig_buf = sig.to_u8_vec();
        if sig_buf.len() != 65 {
            return false;
        }
        input_script.chunks[0].buffer = Some(sig_buf);
        tx_input.script = input_script.clone();
        self.tx = tx_clone;
        true
    }

    pub fn sign_all(&mut self) -> bool {
        for i in 0..self.tx.inputs.len() {
            if !self.sign(i) {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key::Key;
    use crate::address::Address;
    use crate::address_key_map::AddressKeyMap;
    use crate::script::Script;
    use crate::script_interpreter::ScriptInterpreter;
    use crate::tx_builder::TxBuilder;
    use crate::tx_output::TxOutput;
    use crate::tx_output_map::TxOutputMap;

    #[test]
    fn should_sign_a_tx() {
        let mut tx_out_map = TxOutputMap::new();
        let mut address_key_map = AddressKeyMap::new();

        // generate 5 keys, 5 outputs, and add them to the txOutMap
        for i in 0..5 {
            let key = Key::from_random();
            let address = Address::new(key.public_key.clone());
            address_key_map.add(key.clone(), &address.address.clone());
            let script = Script::from_address_output(&address.address.clone());
            let output = TxOutput::new(100, script);
            tx_out_map.add(output, vec![0; 32].as_slice(), i);
        }

        let mut tx_builder = TxBuilder::new(&tx_out_map, Script::from_string("").unwrap());
        tx_builder.add_output(50, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_map, &address_key_map);
        let signed = tx_signer.sign(0);
        let signed_tx = tx_signer.tx;
        assert_eq!(signed, true);

        let tx_input = &signed_tx.inputs[0];
        let tx_output = tx_out_map
            .get(&tx_input.input_tx_id.clone(), tx_input.input_tx_index)
            .unwrap();
        let exec_script = tx_output.script.clone();
        let sig_buf = tx_input.script.chunks[0].buffer.clone().unwrap();
        assert_eq!(sig_buf.len(), 65);
        let pub_key_buf = tx_input.script.chunks[1].buffer.clone().unwrap();
        assert_eq!(pub_key_buf.len(), 33);

        let stack = vec![sig_buf, pub_key_buf];

        let mut script_interpreter =
            ScriptInterpreter::from_output_script_tx(exec_script, signed_tx, 0, stack, 100);

        let result = script_interpreter.eval_script();
        assert_eq!(result, true);
    }

    #[test]
    fn should_sign_two_inputs() {
        let mut tx_out_map = TxOutputMap::new();
        let mut address_key_map = AddressKeyMap::new();

        // generate 5 keys, 5 outputs, and add them to the txOutMap
        for i in 0..5 {
            let key = Key::from_random();
            let address = Address::new(key.public_key.clone());
            address_key_map.add(key.clone(), &address.address.clone());
            let script = Script::from_address_output(&address.address.clone());
            let output = TxOutput::new(100, script);
            tx_out_map.add(output, vec![0; 32].as_slice(), i);
        }

        let mut tx_builder = TxBuilder::new(&tx_out_map, Script::from_string("").unwrap());
        tx_builder.add_output(100, Script::from_string("").unwrap());
        tx_builder.add_output(100, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 2);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 100);
        assert_eq!(tx.outputs[1].value, 100);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_map, &address_key_map);
        let signed1 = tx_signer.sign(0);
        let signed2 = tx_signer.sign(1);
        let signed_tx = tx_signer.tx;
        assert_eq!(signed1, true);
        assert_eq!(signed2, true);

        let tx_input_1 = &signed_tx.inputs[0];
        let tx_output_1 = tx_out_map
            .get(&tx_input_1.input_tx_id.clone(), tx_input_1.input_tx_index)
            .unwrap();
        let exec_script_1 = tx_output_1.script.clone();
        let sig_buf_1 = tx_input_1.script.chunks[0].buffer.clone().unwrap();
        assert_eq!(sig_buf_1.len(), 65);
        let pub_key_buf_1 = tx_input_1.script.chunks[1].buffer.clone().unwrap();
        assert_eq!(pub_key_buf_1.len(), 33);

        let stack_1 = vec![sig_buf_1, pub_key_buf_1];

        let mut script_interpreter_1 = ScriptInterpreter::from_output_script_tx(
            exec_script_1,
            signed_tx.clone(),
            0,
            stack_1,
            100,
        );

        let result_1 = script_interpreter_1.eval_script();
        assert_eq!(result_1, true);

        let tx_input_2 = &signed_tx.inputs[1];
        let tx_output_2 = tx_out_map
            .get(&tx_input_2.input_tx_id.clone(), tx_input_2.input_tx_index)
            .unwrap();
        let exec_script_2 = tx_output_2.script.clone();
        let sig_buf_2 = tx_input_2.script.chunks[0].buffer.clone().unwrap();
        assert_eq!(sig_buf_2.len(), 65);
        let pub_key_buf_2 = tx_input_2.script.chunks[1].buffer.clone().unwrap();
        assert_eq!(pub_key_buf_2.len(), 33);

        let stack_2 = vec![sig_buf_2, pub_key_buf_2];

        let mut script_interpreter_2 = ScriptInterpreter::from_output_script_tx(
            exec_script_2,
            signed_tx.clone(),
            1,
            stack_2,
            100,
        );

        let result_2 = script_interpreter_2.eval_script();
        assert_eq!(result_2, true);
    }
}
