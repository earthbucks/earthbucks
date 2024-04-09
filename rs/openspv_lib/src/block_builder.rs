use crate::block::Block;
use crate::block_header::BlockHeader;
use crate::merkle_txs::MerkleTxs;
use crate::tx::Tx;
// use crate::script::Script;
// use crate::tx_input::TxInput;
// use crate::tx_output::TxOutput;

pub struct BlockBuilder {
    pub header: BlockHeader,
    pub txs: Vec<Tx>,
    pub merkle_txs: MerkleTxs,
}

impl BlockBuilder {
    pub fn new(header: BlockHeader, txs: Vec<Tx>, merkle_txs: MerkleTxs) -> Self {
        Self {
            header,
            txs,
            merkle_txs,
        }
    }

    pub fn from_block(block: Block) -> Self {
        let header = block.header;
        let txs = block.txs;
        let merkle_txs = MerkleTxs::new(txs.clone());
        Self::new(header, txs, merkle_txs)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::block::Block;
    use crate::block_header::BlockHeader;
    use crate::tx::Tx;

    #[test]
    fn test_from_block() {
        let bh = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
        );
        let tx = Tx::new(1, vec![], vec![], 0);
        let block = Block::new(bh.clone(), vec![tx]);
        let bb = BlockBuilder::from_block(block);
        assert_eq!(bb.header.version, bh.version);
        assert_eq!(bb.header.prev_block_id, bh.prev_block_id);
        assert_eq!(bb.header.merkle_root, bh.merkle_root);
        assert_eq!(bb.header.timestamp, bh.timestamp);
        assert_eq!(bb.header.target, bh.target);
    }
}
