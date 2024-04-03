use crate::pub_key_hash_key_map::PubKeyHashKeyMap;
use crate::transaction::Transaction;
use crate::transaction_output_map::TransactionOutputMap;
use crate::transaction_signature::TransactionSignature;

pub struct TransactionSigner {
    transaction: Transaction,
    pub_key_hash_key_map: PubKeyHashKeyMap,
    tx_out_map: TransactionOutputMap,
}

impl TransactionSigner {
    pub fn new(
        transaction: Transaction,
        tx_out_map: TransactionOutputMap,
        pub_key_hash_key_map: PubKeyHashKeyMap,
    ) -> Self {
        Self {
            transaction,
            tx_out_map,
            pub_key_hash_key_map,
        }
    }

    pub fn sign(&mut self, n_in: usize) -> bool {
        let mut transaction_clone = self.transaction.clone();
        let transaction_input = &mut transaction_clone.inputs[n_in];
        let tx_out_hash = &transaction_input.input_tx_id;
        let output_index = transaction_input.input_tx_index;
        let tx_out = match self.tx_out_map.get(&tx_out_hash, output_index) {
            Some(tx_out) => tx_out,
            None => return false,
        };
        if !tx_out.script.is_pub_key_hash_output() {
            return false;
        }
        let pub_key_hash = match &tx_out.script.chunks[2].buffer {
            Some(pub_key_hash) => pub_key_hash,
            None => return false,
        };
        let input_script = &mut transaction_input.script;
        if !input_script.is_pub_key_hash_input() {
            return false;
        }
        let key = match self.pub_key_hash_key_map.get(pub_key_hash) {
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
        let sig = self.transaction.sign(
            n_in,
            private_key_array,
            output_script_buf.to_vec(),
            output_amount,
            TransactionSignature::SIGHASH_ALL,
        );
        let sig_buf = sig.to_u8_vec();
        if sig_buf.len() != 65 {
            return false;
        }
        input_script.chunks[0].buffer = Some(sig_buf);
        transaction_input.script = input_script.clone();
        self.transaction = transaction_clone;
        true
    }

    pub fn sign_all(&mut self) -> bool {
        for i in 0..self.transaction.inputs.len() {
            if !self.sign(i) {
                return false;
            }
        }
        true
    }
}
