
use earthbucks_lib::iso_buf_reader::*;
use earthbucks_lib::script::Script;
use earthbucks_lib::tx_out::*;

#[test]
fn test_tx_output_from_iso_buf_and_to_iso_buf() {
    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);
    let result = TxOut::from_iso_buf(tx_output.to_iso_buf());
    let result = match result {
        Ok(tx_output) => tx_output,
        Err(e) => panic!("{}", e),
    };
    assert_eq!(
        hex::encode(tx_output.to_iso_buf()),
        hex::encode(result.to_iso_buf())
    );
}

#[test]
fn test_big_push_data() {
    let data = vec![0u8; 0xffff];
    let value = 100;
    let script = Script::from_iso_str(&format!("0x{} DOUBLEBLAKE3", hex::encode(data))).unwrap();
    let tx_output = TxOut::new(value, script);
    let result = TxOut::from_iso_buf(tx_output.to_iso_buf()).unwrap();
    assert_eq!(
        hex::encode(tx_output.to_iso_buf()),
        hex::encode(result.to_iso_buf())
    );
}

#[test]
fn test_buffer_reader() {
    let value = 100;
    let script = Script::from_iso_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
    let tx_output = TxOut::new(value, script);
    let result =
        TxOut::from_iso_buf_reader(&mut IsoBufReader::new(tx_output.to_iso_buf())).unwrap();
    assert_eq!(
        hex::encode(tx_output.to_iso_buf()),
        hex::encode(result.to_iso_buf())
    );
}
