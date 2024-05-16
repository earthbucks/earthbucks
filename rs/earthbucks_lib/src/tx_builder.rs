use crate::script::Script;
use crate::tx::Tx;
use crate::tx_in::TxIn;
use crate::tx_out::TxOut;
use crate::tx_out_bn_map::TxOutBnMap;

pub struct TxBuilder {
    input_tx_out_bn_map: TxOutBnMap, // TODO: This should be a vector of TxOutMap
    tx: Tx,
    change_script: Script,
    input_amount: u64,
    lock_abs: u64,
    working_block_num: u64,
}

impl TxBuilder {
    pub fn new(
        input_tx_out_bn_map: &TxOutBnMap,
        change_script: Script,
        lock_abs: u64,
        working_block_num: u64,
    ) -> Self {
        Self {
            tx: Tx::new(1, vec![], vec![], 0),
            input_tx_out_bn_map: input_tx_out_bn_map.clone(),
            change_script,
            input_amount: 0,
            lock_abs,
            working_block_num,
        }
    }

    pub fn add_output(&mut self, tx_out: TxOut) {
        self.tx.outputs.push(tx_out);
    }

    // "tx fees", also called "change fees", are zero on earthbucks. this
    // simplifies the logic of building a tx. input must be exactly equal to
    // output to be valid. remainder goes to change, which is owned by the user.
    // transaction fees are paid by making a separate transaction to a mine.
    pub fn build(&mut self) -> Result<Tx, String> {
        self.tx.lock_abs = self.lock_abs;
        self.tx.inputs = vec![];
        let total_spend_amount: u64 = self.tx.outputs.iter().map(|output| output.value).sum();
        let mut change_amount = 0;
        let mut input_amount = 0;
        for (tx_out_id, tx_out_bn) in self.input_tx_out_bn_map.map.iter() {
            let prev_block_num = tx_out_bn.block_num;
            let tx_out = &tx_out_bn.tx_out;
            let tx_id = TxOutBnMap::name_to_tx_id(tx_out_id);
            let tx_out_num = TxOutBnMap::name_to_tx_out_num(tx_out_id);
            let input_script: Script = if tx_out.script.is_pkh_output() {
                Script::from_pkh_input_placeholder()
            } else if tx_out.script.is_pkhx_3m_output() {
                let expired =
                    self.working_block_num > prev_block_num + Script::PKHX_3M_LOCK_REL as u64;
                if expired {
                    Script::from_expired_pkhx_input()
                } else {
                    Script::from_unexpired_pkhx_input_placeholder()
                }
            } else if tx_out.script.is_pkhx_1h_output() {
                let expired =
                    self.working_block_num > prev_block_num + Script::PKHX_1H_LOCK_REL as u64;
                if expired {
                    Script::from_expired_pkhx_input()
                } else {
                    Script::from_unexpired_pkhx_input_placeholder()
                }
            } else {
                return Err("unsupported script type".to_string());
            };
            let tx_input = TxIn::new(tx_id, tx_out_num, input_script, 0);
            self.tx.inputs.push(tx_input);
            input_amount += tx_out.value;
            if input_amount >= total_spend_amount {
                change_amount = input_amount - total_spend_amount;
                break;
            }
        }
        self.input_amount = input_amount;
        if change_amount > 0 {
            let tx_out = TxOut::new(change_amount, self.change_script.clone());
            self.add_output(tx_out);
        }
        Ok(self.tx.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::key_pair::KeyPair;
    use crate::pkh::Pkh;
    use crate::script::Script;

    fn setup() -> TxBuilder {
        let mut tx_out_bn_map = TxOutBnMap::new();
        let change_script = Script::from_iso_str("");

        for i in 0..5 {
            let key = KeyPair::from_random();
            let pkh = Pkh::from_pub_key_buffer(key.pub_key.buf.to_vec());
            let script = Script::from_pkh_output(pkh.to_iso_buf());
            let tx_out = TxOut::new(100, script);
            let block_num = 0;
            tx_out_bn_map.add(&[0; 32], i, tx_out, block_num);
        }

        TxBuilder::new(&tx_out_bn_map, change_script.unwrap(), 0, 0)
    }

    #[test]
    fn test_build_valid_tx_when_input_is_enough_to_cover_output() {
        let mut tx_builder = setup();
        let tx_out = TxOut::new(50, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 2);
        assert_eq!(tx.outputs[0].value, 50);
    }

    #[test]
    fn test_build_invalid_tx_when_input_is_insufficient_to_cover_output() {
        let mut tx_builder = setup();
        let tx_out = TxOut::new(10000, Script::from_empty());
        tx_builder.add_output(tx_out);

        let tx = tx_builder.build().unwrap();

        assert_eq!(tx.inputs.len(), 5);
        assert_eq!(tx.outputs.len(), 1);
        assert_eq!(tx_builder.input_amount, 500);
        assert_eq!(tx.outputs[0].value, 10000);
    }
}
