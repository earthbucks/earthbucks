use earthbucks_lib::block::Block;
use earthbucks_lib::header::Header;
use earthbucks_lib::iso_buf_reader::IsoBufReader;
use earthbucks_lib::tx::Tx;

#[test]
fn test_to_buffer_writer() {
    let header = Header {
        version: 1,
        prev_block_id: [0; 32],
        merkle_root: [0; 32],
        timestamp: 0,
        block_num: 0,
        target: [0; 32],
        nonce: [0; 32],
        work_ser_algo: 0,
        work_ser_hash: [0; 32],
        work_par_algo: 0,
        work_par_hash: [0; 32],
    };
    let tx = Tx::new(1, vec![], vec![], 1);
    let block = Block::new(header, vec![tx]);
    let bw = block.to_buffer_writer();
    assert!(!bw.to_iso_buf().is_empty());
}

#[test]
fn test_to_iso_buf_and_from_iso_buf() {
    let header = Header {
        version: 1,
        prev_block_id: [0; 32],
        merkle_root: [0; 32],
        timestamp: 0,
        block_num: 0,
        target: [0; 32],
        nonce: [0; 32],
        work_ser_algo: 0,
        work_ser_hash: [0; 32],
        work_par_algo: 0,
        work_par_hash: [0; 32],
    };
    let tx = Tx::new(1, vec![], vec![], 1);
    let block1 = Block::new(header, vec![tx]);
    let buf = block1.to_iso_buf();
    let block2 = Block::from_iso_buf(buf).unwrap();
    assert_eq!(block1.header.version, block2.header.version);
    assert_eq!(block1.txs[0].version, block2.txs[0].version);
}

#[test]
fn test_from_iso_buf_reader() {
    let header = Header {
        version: 1,
        prev_block_id: [0; 32],
        merkle_root: [0; 32],
        timestamp: 0,
        block_num: 0,
        target: [0; 32],
        nonce: [0; 32],
        work_ser_algo: 0,
        work_ser_hash: [0; 32],
        work_par_algo: 0,
        work_par_hash: [0; 32],
    };
    let tx = Tx::new(1, vec![], vec![], 1);
    let block1 = Block::new(header, vec![tx]);
    let buf = block1.to_iso_buf();
    let mut br = IsoBufReader::new(buf);
    let block2 = Block::from_iso_buf_reader(&mut br).unwrap();
    assert_eq!(block1.header.version, block2.header.version);
    assert_eq!(block1.txs[0].version, block2.txs[0].version);
}

#[test]
fn test_is_genesis() {
    let header = Header {
        version: 1,
        prev_block_id: [0; 32],
        merkle_root: [0; 32],
        timestamp: 0,
        block_num: 0,
        target: [0; 32],
        nonce: [0; 32],
        work_ser_algo: 0,
        work_ser_hash: [0; 32],
        work_par_algo: 0,
        work_par_hash: [0; 32],
    };
    let tx = Tx::new(1, vec![], vec![], 0);
    let block = Block::new(header, vec![tx]);
    assert!(block.header.is_genesis());
}
