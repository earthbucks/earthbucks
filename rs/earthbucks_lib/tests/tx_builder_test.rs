
use earthbucks_lib::key_pair::KeyPair;
use earthbucks_lib::pkh::Pkh;
use earthbucks_lib::script::Script;
use earthbucks_lib::tx_builder::*;
use earthbucks_lib::tx_out::*;
use earthbucks_lib::tx_out_bn_map::*;

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

    TxBuilder::new(&tx_out_bn_map, change_script.unwrap(), 0)
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
