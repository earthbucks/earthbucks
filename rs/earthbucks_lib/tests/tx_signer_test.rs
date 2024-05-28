use earthbucks_lib::key_pair::KeyPair;
use earthbucks_lib::pkh::Pkh;
use earthbucks_lib::pkh_key_map::PkhKeyMap;
use earthbucks_lib::pub_key::PubKey;
use earthbucks_lib::script::Script;
use earthbucks_lib::script_interpreter::ScriptInterpreter;
use earthbucks_lib::tx::HashCache;
use earthbucks_lib::tx_builder::TxBuilder;
use earthbucks_lib::tx_out::TxOut;
use earthbucks_lib::tx_out_bn_map::TxOutBnMap;
use earthbucks_lib::tx_signature::*;
use earthbucks_lib::tx_signer::*;

#[test]
fn should_sign_a_tx() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();

    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.pub_key.buf.to_vec());
        pkh_key_map.add(key.clone(), &pkh.buf.clone());
        let script = Script::from_pkh_output(&pkh.buf.clone());
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(vec![0; 32].as_slice(), i, output, block_num);
    }

    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, Script::from_empty(), 0);
    let tx_out = TxOut::new(50, Script::from_empty());
    tx_builder.add_output(tx_out);

    let tx = tx_builder.build().unwrap();

    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 2);
    assert_eq!(tx.outputs[0].value, 50);

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, 0);
    let tx_res = tx_signer.sign_input(0);
    let signed_tx = tx_signer.tx;
    assert!(tx_res.is_ok());

    let tx_input = &signed_tx.inputs[0];
    let tx_out_bn = tx_out_bn_map
        .get(&tx_input.input_tx_id.clone(), tx_input.input_tx_out_num)
        .unwrap();
    let exec_script = tx_out_bn.tx_out.script.clone();
    let sig_buf = tx_input.script.chunks[0].buffer.clone().unwrap();
    assert_eq!(sig_buf.len(), TxSignature::SIZE);
    let pub_key_buf = tx_input.script.chunks[1].buffer.clone().unwrap();
    assert_eq!(pub_key_buf.len(), PubKey::SIZE);

    let stack = vec![sig_buf, pub_key_buf];

    let mut hash_cache = HashCache::new();
    let mut script_interpreter = ScriptInterpreter::from_output_script_tx(
        exec_script,
        signed_tx,
        0,
        stack,
        100,
        &mut hash_cache,
    );

    let result = script_interpreter.eval_script();
    assert!(result);
}

#[test]
fn should_sign_two_inputs() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();

    // generate 5 keys, 5 outputs, and add them to the txOutMap
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.pub_key.buf.to_vec());
        pkh_key_map.add(key.clone(), &pkh.buf.clone());
        let script = Script::from_pkh_output(&pkh.buf.clone());
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(vec![0; 32].as_slice(), i, output, block_num);
    }

    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, Script::from_empty(), 0);
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
    let tx_res2 = tx_signer.sign_input(1);
    let signed_tx = tx_signer.tx;
    assert!(tx_res1.is_ok());
    assert!(tx_res2.is_ok());

    let tx_input_1 = &signed_tx.inputs[0];
    let tx_out_bn_1 = tx_out_bn_map
        .get(&tx_input_1.input_tx_id.clone(), tx_input_1.input_tx_out_num)
        .unwrap();
    let tx_out_1 = tx_out_bn_1.tx_out.clone();
    let exec_script_1 = tx_out_1.script.clone();
    let sig_buf_1 = tx_input_1.script.chunks[0].buffer.clone().unwrap();
    assert_eq!(sig_buf_1.len(), TxSignature::SIZE);
    let pub_key_buf_1 = tx_input_1.script.chunks[1].buffer.clone().unwrap();
    assert_eq!(pub_key_buf_1.len(), PubKey::SIZE);

    let stack_1 = vec![sig_buf_1, pub_key_buf_1];

    let mut hash_cache = HashCache::new();
    let mut script_interpreter_1 = ScriptInterpreter::from_output_script_tx(
        exec_script_1,
        signed_tx.clone(),
        0,
        stack_1,
        100,
        &mut hash_cache,
    );

    let result_1 = script_interpreter_1.eval_script();
    assert!(result_1);

    let tx_input_2 = &signed_tx.inputs[1];
    let tx_out_bn_2 = tx_out_bn_map
        .get(&tx_input_2.input_tx_id.clone(), tx_input_2.input_tx_out_num)
        .unwrap();
    let tx_out_2 = tx_out_bn_2.tx_out.clone();
    let exec_script_2 = tx_out_2.script.clone();
    let sig_buf_2 = tx_input_2.script.chunks[0].buffer.clone().unwrap();
    assert_eq!(sig_buf_2.len(), TxSignature::SIZE);
    let pub_key_buf_2 = tx_input_2.script.chunks[1].buffer.clone().unwrap();
    assert_eq!(pub_key_buf_2.len(), PubKey::SIZE);

    let stack_2 = vec![sig_buf_2, pub_key_buf_2];
    let mut hash_cache = HashCache::new();

    let mut script_interpreter_2 = ScriptInterpreter::from_output_script_tx(
        exec_script_2,
        signed_tx.clone(),
        1,
        stack_2,
        100,
        &mut hash_cache,
    );

    let result_2 = script_interpreter_2.eval_script();
    assert!(result_2);
}
