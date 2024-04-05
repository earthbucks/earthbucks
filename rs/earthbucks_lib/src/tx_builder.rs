use crate::script::Script;
use crate::tx::Tx;
use crate::tx_input::TxInput;
use crate::tx_output::TxOutput;
use crate::tx_output_map::TxOutputMap;

pub struct TxBuilder {
    tx_out_map: TxOutputMap,
    tx: Tx,
    change_script: Script,
    input_amount: u64,
}

impl TxBuilder {
    pub fn new(tx_out_map: &TxOutputMap, change_script: Script) -> Self {
        Self {
            tx: Tx::new(1, vec![], vec![], 0),
            tx_out_map: tx_out_map.clone(),
            change_script,
            input_amount: 0,
        }
    }

    pub fn add_output(&mut self, value: u64, script: Script) {
        let tx_output = TxOutput::new(value, script);
        self.tx_out_map.add(
            tx_output.clone(),
            &self.tx.id(),
            self.tx.outputs.len() as u32,
        );
        self.tx.outputs.push(tx_output);
    }

    pub fn build(&mut self) -> Tx {
        // assume zero fees and send 100% of remainder to change. we need to
        // compute the total spend amount, and then loop through every txOut,
        // and add the txOut to the inputs, until we have enough to cover the
        // total spend amount. then we add the change output. note that this
        // function can produce txs with insufficient inputs, and
        // therefore invalid txs. you must input enough to cover the
        // total spend amount or the output will be invalid. note also that this
        // tx is not signed.
        self.tx.inputs = vec![];
        let total_spend_amount: u64 = self.tx.outputs.iter().map(|output| output.value).sum();
        let mut change_amount = 0;
        let mut input_amount = 0;
        for (tx_out_id, tx_out) in self.tx_out_map.map.iter() {
            if !tx_out.script.is_pub_key_hash_output() {
                continue;
            }
            let tx_id_hash = TxOutputMap::name_to_tx_id_hash(tx_out_id);
            let output_index = TxOutputMap::name_to_output_index(tx_out_id);
            let input_script = Script::from_pub_key_hash_input_placeholder();
            let tx_input = TxInput::new(tx_id_hash, output_index, input_script, 0xffffffff);
            input_amount += tx_out.value;
            self.tx.inputs.push(tx_input);
            if input_amount >= total_spend_amount {
                change_amount = input_amount - total_spend_amount;
                break;
            }
        }
        self.input_amount = input_amount;
        if change_amount > 0 {
            self.add_output(change_amount, self.change_script.clone());
        }
        self.tx.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key::Key;
    use crate::pub_key_hash::PubKeyHash;
    use crate::script::Script;

    fn setup() -> TxBuilder {
        let mut tx_out_map = TxOutputMap::new();
        let change_script = Script::from_string("");

        for i in 0..5 as u32 {
            let key = Key::from_random();
            let pub_key_hash = PubKeyHash::new(key.public_key().to_vec());
            let script = Script::from_pub_key_hash_output(pub_key_hash.pub_key_hash());
            let output = TxOutput::new(100, script);
            tx_out_map.add(output, &vec![0; 32], i);
        }

        TxBuilder::new(&tx_out_map, change_script.unwrap())
    }

    #[test]
    fn test_build_valid_tx_when_input_is_enough_to_cover_output() {
        let mut tx_builder = setup();
        tx_builder.add_output(50, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
    }

    #[test]
    fn test_build_invalid_tx_when_input_is_insufficient_to_cover_output() {
        let mut tx_builder = setup();
        tx_builder.add_output(10000, Script::from_string("").unwrap());

        let tx = tx_builder.build();

        assert_eq!(tx.inputs.len(), 5);
        assert_eq!(tx.outputs.len(), 1);
        assert_eq!(tx_builder.input_amount, 500);
        assert_eq!(tx.outputs[0].value, 10000);
    }
}
