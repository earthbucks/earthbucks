use crate::block::Block;
use crate::header_chain::HeaderChain;
use crate::tx_output_map::TxOutputMap;

pub struct BlockVerifier {
    pub block: Block,
    pub tx_output_map: TxOutputMap, // all (valid, confirmed) inputs not already in the block
    pub lch: HeaderChain,           // longest chain
}

impl BlockVerifier {
    pub fn new(block: Block, tx_output_map: TxOutputMap, lch: HeaderChain) -> Self {
        Self {
            block,
            tx_output_map,
            lch,
        }
    }
}
