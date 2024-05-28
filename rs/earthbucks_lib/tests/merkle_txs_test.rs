
use earthbucks_lib::merkle_txs::*;
use earthbucks_lib::tx::*;

#[test]
fn verify_with_1_tx() {
    let tx1 = Tx::new(0, vec![], vec![], 0);
    let merkle_txs = MerkleTxs::new(vec![tx1]);
    let verified = merkle_txs.verify();
    assert!(verified);
}

#[test]
fn verify_with_2_txs() {
    let tx1 = Tx::new(0, vec![], vec![], 0);
    let tx2 = Tx::new(0, vec![], vec![], 0);
    let merkle_txs = MerkleTxs::new(vec![tx1, tx2]);
    let verified = merkle_txs.verify();
    assert!(verified);
}

#[test]
fn verify_with_3_txs() {
    let tx1 = Tx::new(0, vec![], vec![], 0);
    let tx2 = Tx::new(0, vec![], vec![], 0);
    let tx3 = Tx::new(0, vec![], vec![], 0);
    let merkle_txs = MerkleTxs::new(vec![tx1, tx2, tx3]);
    let verified = merkle_txs.verify();
    assert!(verified);
}
