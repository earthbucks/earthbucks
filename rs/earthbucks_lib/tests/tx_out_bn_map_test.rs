use earthbucks_lib::script::Script;
use earthbucks_lib::tx_out::*;
use earthbucks_lib::tx_out_bn::*;
use earthbucks_lib::tx_out_bn_map::*;

#[test]
fn name_from_output() {
    let tx_id_hash = [1, 2, 3, 4];
    let output_index = 0;
    let name = TxOutBnMap::name_from_output(&tx_id_hash, output_index);
    assert_eq!(name, "01020304:0");
}

#[test]
fn add() {
    let mut tx_out_map = TxOutBnMap::new();
    let tx_output = TxOut::new(100, Script::from_empty());
    let tx_id_hash = [1, 2, 3, 4];
    let output_index = 0;
    let block_num: u64 = 0;
    let tx_out_bn = TxOutBn {
        tx_out: tx_output.clone(),
        block_num,
    };
    tx_out_map.add(&tx_id_hash, output_index, tx_output.clone(), block_num);
    assert_eq!(
        tx_out_map.get(&tx_id_hash, output_index).unwrap(),
        &tx_out_bn
    );
}

#[test]
fn remove() {
    let mut tx_out_map = TxOutBnMap::new();
    let tx_output = TxOut::new(100, Script::from_empty());
    let tx_id_hash = [1, 2, 3, 4];
    let output_index = 0;
    let block_num = 0;
    tx_out_map.add(&tx_id_hash, output_index, tx_output, block_num);
    tx_out_map.remove(&tx_id_hash, output_index);
    assert_eq!(tx_out_map.get(&tx_id_hash, output_index), None);
}

#[test]
fn get() {
    let mut tx_out_map = TxOutBnMap::new();
    let tx_output = TxOut::new(100, Script::from_empty());
    let tx_id_hash = [1, 2, 3, 4];
    let output_index = 0;
    let block_num = 0;
    let tx_out_bn = TxOutBn {
        tx_out: tx_output.clone(),
        block_num,
    };
    tx_out_map.add(&tx_id_hash, output_index, tx_output.clone(), block_num);
    let retrieved = tx_out_map.get(&tx_id_hash, output_index);
    assert_eq!(retrieved, Some(&tx_out_bn));
}

#[test]
fn test_values() {
    let mut tx_out_map = TxOutBnMap::new();
    let tx_out1 = TxOut::new(100, Script::from_empty());
    let tx_out2 = TxOut::new(200, Script::from_empty());
    let tx_id_hash1 = [1, 2, 3, 4];
    let tx_id_hash2 = [5, 6, 7, 8];
    let output_index = 0;
    let block_num = 0;
    let tx_out_bn1 = TxOutBn {
        tx_out: tx_out1.clone(),
        block_num,
    };
    let tx_out_bn2 = TxOutBn {
        tx_out: tx_out2.clone(),
        block_num,
    };
    tx_out_map.add(&tx_id_hash1, output_index, tx_out1.clone(), block_num);
    tx_out_map.add(&tx_id_hash2, output_index, tx_out2.clone(), block_num);
    let values: Vec<&TxOutBn> = tx_out_map.values();
    assert_eq!(values.len(), 2);
    assert!(values.contains(&&tx_out_bn1));
    assert!(values.contains(&&tx_out_bn2));
}
