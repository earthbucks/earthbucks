use crate::script::Script;
use crate::transaction::Transaction;
use crate::transaction_input::TransactionInput;
use crate::transaction_output::TransactionOutput;
use crate::transaction_output_map::TransactionOutputMap;

pub struct TransactionBuilder {
    tx_out_map: TransactionOutputMap,
    transaction: Transaction,
    change_script: Script,
    input_amount: u64,
}

impl TransactionBuilder {
    pub fn new(tx_out_map: &TransactionOutputMap, change_script: Script) -> Self {
        Self {
            transaction: Transaction::new(1, vec![], vec![], 0),
            tx_out_map: tx_out_map.clone(),
            change_script,
            input_amount: 0,
        }
    }

    pub fn add_output(&mut self, value: u64, script: Script) {
        let transaction_output = TransactionOutput::new(value, script);
        self.tx_out_map.add(
            transaction_output.clone(),
            &self.transaction.id(),
            self.transaction.outputs.len() as u32,
        );
        self.transaction.outputs.push(transaction_output);
    }

    pub fn build(&mut self) -> Transaction {
        // assume zero fees and send 100% of remainder to change. we need to
        // compute the total spend amount, and then loop through every txOut,
        // and add the txOut to the inputs, until we have enough to cover the
        // total spend amount. then we add the change output. note that this
        // function can produce transactions with insufficient inputs, and
        // therefore invalid transactions. you must input enough to cover the
        // total spend amount or the output will be invalid. note also that this
        // transaction is not signed.
        self.transaction.inputs = vec![];
        let total_spend_amount: u64 = self
            .transaction
            .outputs
            .iter()
            .map(|output| output.value)
            .sum();
        let mut change_amount = 0;
        let mut input_amount = 0;
        for (tx_out_id, tx_out) in self.tx_out_map.map.iter() {
            if !tx_out.script.is_pub_key_hash_output() {
                continue;
            }
            let tx_id_hash = TransactionOutputMap::name_to_tx_id_hash(tx_out_id);
            let output_index = TransactionOutputMap::name_to_output_index(tx_out_id);
            let input_script = Script::from_pub_key_hash_input_placeholder();
            let transaction_input =
                TransactionInput::new(tx_id_hash, output_index, input_script, 0xffffffff);
            input_amount += tx_out.value;
            self.transaction.inputs.push(transaction_input);
            if input_amount >= total_spend_amount {
                change_amount = input_amount - total_spend_amount;
                break;
            }
        }
        self.input_amount = input_amount;
        if change_amount > 0 {
            self.add_output(change_amount, self.change_script.clone());
        }
        self.transaction.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key::Key;
    use crate::pub_key_hash::PubKeyHash;
    use crate::script::Script;

    fn setup() -> TransactionBuilder {
        let mut tx_out_map = TransactionOutputMap::new();
        let change_script = Script::from_string("");

        for i in 0..5 as u32 {
            let key = Key::from_random();
            let pub_key_hash = PubKeyHash::new(key.public_key().to_vec());
            let script = Script::from_pub_key_hash_output(pub_key_hash.pub_key_hash());
            let output = TransactionOutput::new(100, script);
            tx_out_map.add(output, &vec![0; 32], i);
        }

        TransactionBuilder::new(&tx_out_map, change_script.unwrap())
    }

    #[test]
    fn test_build_valid_transaction_when_input_is_enough_to_cover_output() {
        let mut transaction_builder = setup();
        transaction_builder.add_output(50, Script::from_string("").unwrap());

        let transaction = transaction_builder.build();

        assert_eq!(transaction.inputs.len(), 1);
        assert_eq!(transaction.outputs.len(), 2);
        assert_eq!(transaction.outputs[0].value, 50);
    }

    #[test]
    fn test_build_invalid_transaction_when_input_is_insufficient_to_cover_output() {
        let mut transaction_builder = setup();
        transaction_builder.add_output(10000, Script::from_string("").unwrap());

        let transaction = transaction_builder.build();

        assert_eq!(transaction.inputs.len(), 5);
        assert_eq!(transaction.outputs.len(), 1);
        assert_eq!(transaction_builder.input_amount, 500);
        assert_eq!(transaction.outputs[0].value, 10000);
    }
}
