use earthbucks_lib::block::Block;
use earthbucks_lib::block_builder::BlockBuilder;
use earthbucks_lib::header::Header;
use earthbucks_lib::tx::Tx;

#[test]
fn test_from_block() {
    let bh = Header {
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
    let block = Block::new(bh.clone(), vec![tx]);
    let bb = BlockBuilder::from_block(block);
    assert_eq!(bb.header.version, bh.version);
    assert_eq!(bb.header.prev_block_id, bh.prev_block_id);
    assert_eq!(bb.header.merkle_root, bh.merkle_root);
    assert_eq!(bb.header.timestamp, bh.timestamp);
    assert_eq!(bb.header.target, bh.target);
}
