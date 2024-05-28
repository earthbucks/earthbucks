use crate::block::Block;
use crate::header::Header;
use crate::merkle_txs::MerkleTxs;
use crate::script::Script;
use crate::tx::Tx;
use crate::tx_in::TxIn;
use crate::tx_out::TxOut;

pub struct BlockBuilder {
    pub header: Header,
    pub txs: Vec<Tx>,
    pub merkle_txs: MerkleTxs,
}

impl BlockBuilder {
    pub fn new(header: Header, txs: Vec<Tx>, merkle_txs: MerkleTxs) -> Self {
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

    pub fn from_genesis(output_script: Script, output_amount: u64, new_timestamp: u64) -> Self {
        let mut header = Header::from_genesis(new_timestamp);
        let tx_input = TxIn::from_coinbase(output_script.clone());
        let tx_output = TxOut::new(output_amount, output_script.clone());
        let coinbase_tx = Tx::new(1, vec![tx_input], vec![tx_output], 0);
        let txs = vec![coinbase_tx];
        let merkle_txs = MerkleTxs::new(txs.clone());
        let root: [u8; 32] = merkle_txs.root;
        header.merkle_root = root;
        Self::new(header, txs, merkle_txs)
    }
}
