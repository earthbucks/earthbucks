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
    pub fn new(tx_out_map: TransactionOutputMap, change_script: Script) -> Self {
        Self {
            transaction: Transaction::new(1, vec![], vec![], 0),
            tx_out_map,
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
