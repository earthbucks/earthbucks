use earthbucks_lib::hash::*;
use earthbucks_lib::iso_buf_reader::*;
use earthbucks_lib::priv_key::PrivKey;
use earthbucks_lib::script::Script;
use earthbucks_lib::tx::*;
use earthbucks_lib::tx_in::*;
use earthbucks_lib::tx_out::*;
use earthbucks_lib::tx_signature::*;

#[test]
fn test_tx() -> Result<(), String> {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);

    let buf = tx.to_iso_buf();
    let tx2 = Tx::from_iso_buf(buf).unwrap();
    assert_eq!(tx.version, tx2.version);
    assert_eq!(tx.inputs.len(), tx2.inputs.len());
    assert_eq!(tx.outputs.len(), tx2.outputs.len());
    assert_eq!(tx.lock_abs, tx2.lock_abs);
    Ok(())
}

#[test]
fn test_from_iso_buf_reader() -> Result<(), String> {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);

    let buf = tx.to_iso_buf();
    let mut reader = IsoBufReader::new(buf);
    let tx2 = Tx::from_iso_buf_reader(&mut reader).unwrap();
    assert_eq!(tx.version, tx2.version);
    assert_eq!(tx.inputs.len(), tx2.inputs.len());
    assert_eq!(tx.outputs.len(), tx2.outputs.len());
    assert_eq!(tx.lock_abs, tx2.lock_abs);
    Ok(())
}

#[test]
fn test_to_string_and_from_iso_str() -> Result<(), String> {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);

    let hex = tx.to_iso_str();
    let tx2 = Tx::from_iso_str(&hex).unwrap();
    assert_eq!(tx.version, tx2.version);
    assert_eq!(tx.inputs.len(), tx2.inputs.len());
    assert_eq!(tx.outputs.len(), tx2.outputs.len());
    assert_eq!(tx.lock_abs, tx2.lock_abs);
    Ok(())
}

#[test]
fn test_from_coinbase() {
    let input_script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let output_script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let output_amount = 100;
    let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
    assert_eq!(tx.version, 1);
    assert_eq!(tx.inputs.len(), 1);
    assert_eq!(tx.outputs.len(), 1);
    assert_eq!(tx.lock_abs, 0);
}

#[test]
fn test_is_coinbase() {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);
    assert!(!tx.is_coinbase());

    let input_script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let output_script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let output_amount = 100;
    let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
    assert!(tx.is_coinbase());
}

#[test]
fn test_hash_once() {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);
    let expected_hash = blake3_hash(&tx.to_iso_buf());
    assert_eq!(tx.blake3_hash(), expected_hash);
}

#[test]
fn test_hash() {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let lock_rel = 0;
    let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);

    let version = 1;
    let inputs = vec![tx_input];
    let outputs = vec![tx_output];
    let lock_num = 0;
    let tx = Tx::new(version, inputs, outputs, lock_num);
    let expected_hash = double_blake3_hash(&tx.to_iso_buf());
    assert_eq!(tx.id(), expected_hash);
}

#[test]
fn test_hash_prevouts() {
    let version = 1;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    let outputs = vec![TxOut::new(100, Script::from_empty())];

    let tx = Tx::new(version, inputs, outputs, 0);

    let result = tx.hash_prevouts();

    assert_eq!(result.len(), 32);

    let expected =
        hex::decode("2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba").unwrap();
    assert_eq!(result, expected);
}

#[test]
fn test_hash_lock_rel() {
    let version = 1;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    let outputs = vec![TxOut::new(100, Script::from_empty())];

    let tx = Tx::new(version, inputs, outputs, 0);

    let result = tx.hash_lock_rel();

    assert_eq!(result.len(), 32);

    let expected =
        hex::decode("406986f514581cacbf3ab0fc3863b336d137af79318ce4bae553a91435773931").unwrap();
    assert_eq!(result, expected);
}

#[test]
fn test_hash_outputs() {
    let version = 1;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    let outputs = vec![TxOut::new(100, Script::from_empty())];

    let tx = Tx::new(version, inputs, outputs, 0);

    let result = tx.hash_outputs();

    assert_eq!(result.len(), 32);

    let expected =
        hex::decode("8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5").unwrap();
    assert_eq!(result, expected);
}

#[test]
fn test_sighash() {
    let version = 1;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    let outputs = vec![TxOut::new(100, Script::from_empty())];

    let mut tx = Tx::new(version, inputs, outputs, 0);

    let script = Script::from_empty();
    let amount = 1;
    let hash_type = TxSignature::SIGHASH_ALL;
    let preimage = tx.sighash_no_cache(0, script.to_iso_buf(), amount, hash_type);

    let expected =
        hex::decode("a4f4519c65fedfaf43b7cc989f1bcdd55b802738d70f06ea359f411315b71c51").unwrap();
    assert_eq!(preimage, expected);
}

#[test]
fn test_sighash_with_cache() {
    let version = 1;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    let outputs = vec![TxOut::new(100, Script::from_empty())];

    let mut tx = Tx::new(version, inputs, outputs, 0);

    let script = Script::from_empty();
    let amount = 1;
    let hash_type = TxSignature::SIGHASH_ALL;
    let hash_cache = &mut HashCache::new();
    let preimage = tx.sighash_with_cache(0, script.to_iso_buf(), amount, hash_type, hash_cache);

    let expected =
        hex::decode("a4f4519c65fedfaf43b7cc989f1bcdd55b802738d70f06ea359f411315b71c51").unwrap();
    assert_eq!(preimage, expected);
}

#[test]
fn sign_and_verify() {
    // Arrange
    let input_index = 0;
    let private_key =
        hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad").unwrap();
    let script = vec![];
    let amount = 100;
    let hash_type = TxSignature::SIGHASH_ALL;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    assert_eq!(
        hex::encode(inputs[0].to_iso_buf()),
        "0000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    let outputs = vec![TxOut::new(100, Script::from_empty())];
    assert_eq!(hex::encode(outputs[0].to_iso_buf()), "000000000000006400");
    let mut tx = Tx::new(1, inputs, outputs, 0);
    assert_eq!(hex::encode(tx.to_iso_buf()), "01010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000064000000000000000000");

    // Act
    let signature = tx.sign_no_cache(
        input_index,
        private_key.as_slice().try_into().unwrap(),
        script.clone(),
        amount,
        hash_type,
    );

    // Assert
    let expected_signature_hex = "0125c1e7312e2811c13952ea01e39f186cbc3077bef710ef11a363f88eae64ef0c657a1a6fd4bb488b69485f1ce7513fb3bab3cad418bc4f5093f648572f7fc89d";
    assert_eq!(hex::encode(signature.to_iso_buf()), expected_signature_hex);

    // Arrange
    // let key = KeyPair::new(private_key);
    // let public_key = key.public_key();

    let priv_key = PrivKey::from_iso_buf(private_key).unwrap();
    let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();

    // Act
    let result = tx.verify_no_cache(input_index, pub_key_buf, signature, script.clone(), amount);

    // Assert
    assert!(result);
}

#[test]
fn sign_and_verify_with_cache() {
    // Arrange
    let input_index = 0;
    let private_key =
        hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad").unwrap();
    let script = vec![];
    let amount = 100;
    let hash_type = TxSignature::SIGHASH_ALL;
    let inputs = vec![TxIn::new(vec![0; 32], 0, Script::from_empty(), 0)];
    assert_eq!(
        hex::encode(inputs[0].to_iso_buf()),
        "0000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    let outputs = vec![TxOut::new(100, Script::from_empty())];
    assert_eq!(hex::encode(outputs[0].to_iso_buf()), "000000000000006400");
    let mut tx = Tx::new(1, inputs, outputs, 0);
    assert_eq!(hex::encode(tx.to_iso_buf()), "01010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000064000000000000000000");
    let hash_cache_1 = &mut HashCache::new();

    // Act
    let signature = tx.sign_with_cache(
        input_index,
        private_key.as_slice().try_into().unwrap(),
        script.clone(),
        amount,
        hash_type,
        hash_cache_1,
    );

    // Assert
    let expected_signature_hex = "0125c1e7312e2811c13952ea01e39f186cbc3077bef710ef11a363f88eae64ef0c657a1a6fd4bb488b69485f1ce7513fb3bab3cad418bc4f5093f648572f7fc89d";
    assert_eq!(hex::encode(signature.to_iso_buf()), expected_signature_hex);

    // Arrange
    // let key = KeyPair::new(private_key);
    // let public_key = key.public_key();
    let hash_cache_2 = &mut HashCache::new();
    let pub_key_buf = PrivKey::from_iso_buf(private_key)
        .unwrap()
        .to_pub_key_buffer()
        .unwrap();

    // Act
    let result = tx.verify_with_cache(
        input_index,
        pub_key_buf,
        signature,
        script.clone(),
        amount,
        hash_cache_2,
    );

    // Assert
    assert!(result);
}
