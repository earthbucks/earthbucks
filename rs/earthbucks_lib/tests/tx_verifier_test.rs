use earthbucks_lib::key_pair::KeyPair;
use earthbucks_lib::pkh::Pkh;
use earthbucks_lib::pkh_key_map::PkhKeyMap;
use earthbucks_lib::script::Script;
use earthbucks_lib::tx_builder::TxBuilder;
use earthbucks_lib::tx_in::TxIn;
use earthbucks_lib::tx_out::TxOut;
use earthbucks_lib::tx_out_bn_map::TxOutBnMap;
use earthbucks_lib::tx_signer::TxSigner;

use earthbucks_lib::tx_verifier::*;

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

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
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

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
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
fn should_sign_and_verify_unexpired_pkhxr_1h_40m() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_1h_40m_output(&pkh.buf, &pkh.buf);
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
fn should_sign_and_verify_recoverable_pkhxr_1h_40m() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    let working_block_num: u64 = Script::PKHXR_1H_40M_R_LOCK_REL as u64;
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_1h_40m_output(&[0; 32], &pkh.buf);
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
    }

    let change_script = Script::from_empty();
    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

    let recovery_input_script = Script::from_recovery_pkhxr_input_placeholder();
    let tx_in = TxIn::new(
        [0; 32].to_vec(),
        0,
        recovery_input_script,
        Script::PKHXR_1H_40M_R_LOCK_REL,
    );
    tx_builder.add_input(tx_in, 100);

    let tx_out = TxOut::new(50, Script::from_empty());
    tx_builder.add_output(tx_out);

    let tx = tx_builder.build().unwrap();

    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 2);
    assert_eq!(tx.outputs[0].value, 50);
    assert_eq!(tx.outputs[1].value, 50);

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
    let tx_res = tx_signer.sign_input(0);
    let signed_tx = tx_signer.tx;
    assert!(tx_res.is_ok());

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
fn should_sign_and_verify_expired_pkhxr_1h_40m() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    let working_block_num: u64 = Script::PKHXR_1H_40M_X_LOCK_REL as u64;
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_1h_40m_output(&[0; 32], &pkh.buf);
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
    }

    let change_script = Script::from_empty();
    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

    let recovery_input_script = Script::from_expired_pkhxr_input();
    let tx_in = TxIn::new(
        [0; 32].to_vec(),
        0,
        recovery_input_script,
        Script::PKHXR_1H_40M_X_LOCK_REL,
    );
    tx_builder.add_input(tx_in, 100);

    let tx_out = TxOut::new(50, Script::from_empty());
    tx_builder.add_output(tx_out);

    let tx = tx_builder.build().unwrap();

    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 2);
    assert_eq!(tx.outputs[0].value, 50);
    assert_eq!(tx.outputs[1].value, 50);

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
    let tx_res = tx_signer.sign_input(0);
    let signed_tx = tx_signer.tx;
    assert!(tx_res.is_ok());

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
fn should_sign_and_verify_unexpired_pkhxr_90d_60d() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_90d_60d_output(&pkh.buf, &pkh.buf);
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
fn should_sign_and_verify_recoverable_pkhxr_90d_60d() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    let working_block_num: u64 = Script::PKHXR_90D_60D_R_LOCK_REL as u64;
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_90d_60d_output(&[0; 32], &pkh.buf);
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
    }

    let change_script = Script::from_empty();
    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

    let recovery_input_script = Script::from_recovery_pkhxr_input_placeholder();
    let tx_in = TxIn::new(
        [0; 32].to_vec(),
        0,
        recovery_input_script,
        Script::PKHXR_90D_60D_R_LOCK_REL,
    );
    tx_builder.add_input(tx_in, 100);

    let tx_out = TxOut::new(50, Script::from_empty());
    tx_builder.add_output(tx_out);

    let tx = tx_builder.build().unwrap();

    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 2);
    assert_eq!(tx.outputs[0].value, 50);
    assert_eq!(tx.outputs[1].value, 50);

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
    let tx_res = tx_signer.sign_input(0);
    let signed_tx = tx_signer.tx;
    assert!(tx_res.is_ok());

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
fn should_sign_and_verify_expired_pkhxr_90d_60d() {
    let mut tx_out_bn_map = TxOutBnMap::new();
    let mut pkh_key_map = PkhKeyMap::new();
    let working_block_num: u64 = Script::PKHXR_90D_60D_X_LOCK_REL as u64;
    // generate 5 keys, 5 outputs, and add them to the tx_out_map
    for i in 0..5 {
        let key = KeyPair::from_random();
        let pkh = Pkh::from_pub_key_buffer(key.clone().pub_key.buf.to_vec());
        pkh_key_map.add(key, &pkh.buf);
        let script = Script::from_pkhxr_90d_60d_output(&[0; 32], &pkh.buf);
        let output = TxOut::new(100, script);
        let block_num = 0;
        tx_out_bn_map.add(&[0; 32], i, output.clone(), block_num);
    }

    let change_script = Script::from_empty();
    let mut tx_builder = TxBuilder::new(&tx_out_bn_map, change_script, 0);

    let recovery_input_script = Script::from_expired_pkhxr_input();
    let tx_in = TxIn::new(
        [0; 32].to_vec(),
        0,
        recovery_input_script,
        Script::PKHXR_90D_60D_X_LOCK_REL,
    );
    tx_builder.add_input(tx_in, 100);

    let tx_out = TxOut::new(50, Script::from_empty());
    tx_builder.add_output(tx_out);

    let tx = tx_builder.build().unwrap();

    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 2);
    assert_eq!(tx.outputs[0].value, 50);
    assert_eq!(tx.outputs[1].value, 50);

    let mut tx_signer = TxSigner::new(tx.clone(), &tx_out_bn_map, &pkh_key_map, working_block_num);
    let tx_res = tx_signer.sign_input(0);
    let signed_tx = tx_signer.tx;
    assert!(tx_res.is_ok());

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
