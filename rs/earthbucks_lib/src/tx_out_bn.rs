use crate::tx_out::TxOut;

#[derive(Debug, Clone, PartialEq)]
pub struct TxOutBn {
    pub tx_out: TxOut,
    pub block_num: u64,
}
