use earthbucks_lib::header::Header;
use earthbucks_lib::header_chain::HeaderChain;

#[test]
fn test_add() {
    let mut chain = HeaderChain::new();
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
    chain.add(header);
    assert_eq!(chain.headers.len(), 1);
}

#[test]
fn test_get_tip() {
    let mut chain = HeaderChain::new();
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
    chain.add(header);
    assert_eq!(chain.get_tip().unwrap().version, 1);
}
