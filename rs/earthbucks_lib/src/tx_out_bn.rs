use crate::tx_out::TxOut;

#[derive(Debug, Clone, PartialEq, Default)]
pub struct TxOutBn {
    pub tx_out: TxOut,
    pub block_num: u32,
}
