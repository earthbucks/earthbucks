use earthbucks_lib::iso_buf_reader::*;
use earthbucks_lib::iso_buf_writer::*;
use earthbucks_lib::script::*;
use earthbucks_lib::tx_in::*;

#[test]
fn test_tx_input() -> Result<(), String> {
    let input_tx_id = vec![0; 32];
    let input_tx_index = 0;
    let script = Script::from_iso_str("");
    let lock_rel = 0;

    let script_clone = match script {
        Ok(script) => script.clone(),
        Err(_) => return Err("Failed to clone script".to_string()),
    };

    let tx_input = TxIn::new(input_tx_id.clone(), input_tx_index, script_clone, lock_rel);

    // Test to_iso_buf
    let buf = tx_input.to_iso_buf();
    assert!(!buf.is_empty());

    // Test from_iso_buf
    let tx_input2 = TxIn::from_iso_buf(buf).map_err(|e| e.to_string())?;
    assert_eq!(tx_input2.input_tx_id, input_tx_id);
    assert_eq!(tx_input2.input_tx_out_num, input_tx_index);
    match (tx_input.script.to_iso_str(), tx_input2.script.to_iso_str()) {
        (Ok(script_str), Ok(expected_script_str)) => {
            assert_eq!(script_str, expected_script_str)
        }
        _ => return Err("Failed to compare scripts".to_string()),
    }
    assert_eq!(tx_input2.lock_rel, lock_rel);
    Ok(())
}

#[test]
fn test_from_iso_buf_reader() {
    let input_tx_id = vec![0u8; 32];
    let input_tx_index = 1u32;
    let script_hex = "";
    let script = Script::from_iso_str(script_hex);
    let lock_rel = 2u32;

    let script_v8_vec = match script {
        Ok(script) => script.to_iso_buf(),
        Err(_) => panic!("Failed to convert script to u8 vec"),
    };

    let mut writer = IsoBufWriter::new();
    writer.write_iso_buf(input_tx_id.clone());
    writer.write_u32_be(input_tx_index);
    writer.write_var_int(script_v8_vec.len() as u64);
    writer.write_iso_buf(script_v8_vec);
    writer.write_u32_be(lock_rel);

    let mut reader = IsoBufReader::new(writer.to_iso_buf());
    let tx_input = TxIn::from_iso_buf_reader(&mut reader).unwrap();

    let script2 = tx_input.script;
    let script2_hex = match script2.to_iso_str() {
        Ok(script2_hex) => script2_hex,
        Err(_) => panic!("Failed to convert script to string"),
    };

    assert_eq!(tx_input.input_tx_id, input_tx_id);
    assert_eq!(tx_input.input_tx_out_num, input_tx_index);
    assert_eq!(script2_hex, script_hex);
    assert_eq!(tx_input.lock_rel, lock_rel);
}

#[test]
fn test_is_null() {
    let tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0,
        script: Script::from_iso_str("0x121212").unwrap(),
        lock_rel: 0,
    };
    assert!(!tx_input.is_null());

    let null_tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0xffffffff,
        script: Script::from_empty(),
        lock_rel: 0,
    };
    assert!(null_tx_input.is_null());
}

#[test]
fn test_is_minimal_lock() {
    let tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0,
        script: Script::from_iso_str("0x121212").unwrap(),
        lock_rel: 0xffffffff,
    };
    assert!(!tx_input.is_minimal_lock());

    let final_tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0xffffffff,
        script: Script::from_empty(),
        lock_rel: 0,
    };
    assert!(final_tx_input.is_minimal_lock());
}

#[test]
fn test_is_coinbase() {
    let tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0,
        script: Script::from_iso_str("0x121212").unwrap(),
        lock_rel: 0,
    };
    assert!(!tx_input.is_coinbase());

    let coinbase_tx_input = TxIn {
        input_tx_id: [0; 32].to_vec(),
        input_tx_out_num: 0xffffffff,
        script: Script::from_empty(),
        lock_rel: 0,
    };
    assert!(coinbase_tx_input.is_coinbase());
}

#[test]
fn test_from_coinbase() {
    let script = Script::from_iso_str("0x121212").unwrap();
    let tx_input = TxIn::from_coinbase(script);

    assert_eq!(tx_input.input_tx_id, [0; 32].to_vec());
    assert_eq!(tx_input.input_tx_out_num, 0xffffffff);
    assert_eq!(tx_input.script.to_iso_str().unwrap(), "0x121212");
    assert_eq!(tx_input.lock_rel, 0);
}
