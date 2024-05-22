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

#[cfg(test)]
mod tests {
    use crate::key_pair::KeyPair;
    use crate::pkh::Pkh;
    use crate::pkh_key_map::PkhKeyMap;
    use crate::script::Script;
    use crate::tx_builder::TxBuilder;
    use crate::tx_in::TxIn;
    use crate::tx_out::TxOut;
    use crate::tx_out_bn_map::TxOutBnMap;
    use crate::tx_signer::TxSigner;

    use super::*;

    #[test]
    fn should_sign_and_verify_a_tx() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkh_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);

        let verified_input_script = tx_verifier.verify_input_script(0);
        assert!(verified_input_script);

        let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
        assert!(verified_input_lock_rel);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    #[test]
    fn should_sign_and_not_verify_a_tx_with_wrong_lock_num() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkh_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 1);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);
        let verified_input = tx_verifier.verify_input_script(0);
        assert!(verified_input);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(!verified);
    }

    #[test]
    fn should_sign_and_verify_a_tx_with_two_inputs() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkh_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let tx_out = TxOut::new(100, Script::from_empty());
        tx_builder.add_output(tx_out.clone());
        tx_builder.add_output(tx_out.clone());

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 2);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 100);
        assert_eq!(tx.outputs[1].value, 100);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
        let tx_res1 = tx_signer.sign_input(0);
        assert!(tx_res1.is_ok());
        let tx_res2 = tx_signer.sign_input(1);
        assert!(tx_res2.is_ok());
        let signed_tx = tx_signer.tx;

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);
        let verified_input1 = tx_verifier.verify_input_script(0);
        assert!(verified_input1);
        let verified_input2 = tx_verifier.verify_input_script(1);
        assert!(verified_input2);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    #[test]
    fn should_sign_and_verify_unexpired_pkhx_1h() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkhx_1h_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);

        let verified_input_script = tx_verifier.verify_input_script(0);
        assert!(verified_input_script);

        let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
        assert!(verified_input_lock_rel);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    #[test]
    fn should_sign_and_verify_expired_pkhx_1h() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        let working_block_num: u64 = Script::PKHX_1H_LOCK_REL as u64;
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkhx_1h_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let expired_input_script = Script::from_expired_pkhx_input();
        let tx_in = TxIn::new(
            [0; 32].to_vec(),
            0,
            expired_input_script,
            Script::PKHX_1H_LOCK_REL,
        );
        tx_builder.add_input(tx_in, 100);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer =
            TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        assert!(tx.inputs[0].script.is_expired_pkhx_input());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, working_block_num);

        let verified_input_script = tx_verifier.verify_input_script(0);
        assert!(verified_input_script);

        let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
        assert!(verified_input_lock_rel);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    #[test]
    fn should_sign_and_verify_unexpired_pkhx_90d() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkhx_90d_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);

        let verified_input_script = tx_verifier.verify_input_script(0);
        assert!(verified_input_script);

        let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
        assert!(verified_input_lock_rel);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    #[test]
    fn should_sign_and_verify_expired_pkhx_90d() {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let mut pkh_key_map = PkhKeyMap::new();
        let working_block_num: u64 = Script::PKHX_90D_LOCK_REL as u64;
        // generate 5 keys, 5 outputs, and add them to the tx_out_map
        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
            pkh_key_map.add(key, &pkh.buf);
            let script = Script::from_pkhx_90d_output(&pkh.buf);
            let output = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
        }

        let change_script = Script::from_empty();
        let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

        let expired_input_script = Script::from_expired_pkhx_input();
        let tx_in = TxIn::new(
            [0; 32].to_vec(),
            0,
            expired_input_script,
            Script::PKHX_90D_LOCK_REL,
        );
        tx_builder.add_input(tx_in, 100);

        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
        assert_eq!(tx.outputs[1].value, 50);

        let mut tx_signer =
            TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
        let tx_res = tx_signer.sign_input(0);
        let signed_tx = tx_signer.tx;
        assert!(tx_res.is_ok());

        assert!(tx.inputs[0].script.is_expired_pkhx_input());

        let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, working_block_num);

        let verified_input_script = tx_verifier.verify_input_script(0);
        assert!(verified_input_script);

        let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
        assert!(verified_input_lock_rel);

        let verified_scripts = tx_verifier.verify_inputs();
        assert!(verified_scripts);

        let verified_output_values = tx_verifier.verify_output_values();
        assert!(verified_output_values);

        let verified = tx_verifier.verify();
        assert!(verified);
    }

    // #[test]
    // fn should_sign_and_verify_unexpired_pkhxr_1h_40m() {
    //     let mut tx_out_bn_map = TxOutBnMap::new();
    //     let mut pkh_key_map = PkhKeyMap::new();
    //     // generate 5 keys, 5 outputs, and add them to the tx_out_map
    //     for i in 0..5 {
    //         let key = KeyPair::from_random();
    //         let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
    //         pkh_key_map.add(key, &pkh.buf);
    //         let script = Script::from_pkhxr_1h_40m_output(&pkh.buf, &pkh.buf);
    //         let output = TxOut::new(100, script);
    //         let block_num = 0;
    //         tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
    //     }

    //     let change_script = Script::from_empty();
    //     let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

    //     let tx_out = TxOut::new(50, Script::from_empty());
    //     tx_builder.add_output(tx_out);

    //     let tx = tx_builder.build().unwrap();

    //     assert_eq!(tx.inputs.len(), 1);
    //     assert_eq!(tx.outputs.len(), 2);
    //     assert_eq!(tx.outputs[0].value, 50);
    //     assert_eq!(tx.outputs[1].value, 50);

    //     let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
    //     let tx_res = tx_signer.sign_input(0);
    //     let signed_tx = tx_signer.tx;
    //     assert!(tx_res.is_ok());

    //     let mut tx_verifier = TxVerifier::new(signed_tx, &tx_out_bn_map, 0);

    //     let verified_input_script = tx_verifier.verify_input_script(0);
    //     assert!(verified_input_script);

    //     let verified_input_lock_rel = tx_verifier.verify_input_lock_rel(0);
    //     assert!(verified_input_lock_rel);

    //     let verified_scripts = tx_verifier.verify_inputs();
    //     assert!(verified_scripts);

    //     let verified_output_values = tx_verifier.verify_output_values();
    //     assert!(verified_output_values);

    //     let verified = tx_verifier.verify();
    //     assert!(verified);
    // }
}
