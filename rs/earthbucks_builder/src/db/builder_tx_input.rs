use earthbucks_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxInput {
    pub tx_id: Vec<u8>,
    pub tx_in_num: u32,
    pub input_tx_id: Vec<u8>,
    pub input_tx_out_num: u32,
    pub script: Vec<u8>,
    pub sequence: u32,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxInput {
    pub fn from_tx(tx: &Tx) -> Vec<Self> {
        tx.inputs
            .iter()
            .enumerate()
            .map(|(tx_in_num, tx_in)| Self {
                tx_id: tx.id().to_vec(),
                tx_in_num: tx_in_num as u32,
                input_tx_id: tx_in.input_tx_id.clone(),
                input_tx_out_num: tx_in.input_tx_out_num,
                script: tx_in.script.to_iso_buf(),
                sequence: tx_in.sequence,
                created_at: chrono::Utc::now().naive_utc(),
            })
            .collect()
    }
}
