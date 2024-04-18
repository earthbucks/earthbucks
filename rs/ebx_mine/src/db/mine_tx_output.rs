use ebx_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxOutput {
    pub tx_id: String,
    pub tx_out_num: u32,
    pub value: u64,
    pub script: String,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxOutput {
    pub fn from_tx(tx: &Tx) -> Vec<Self> {
        tx.outputs
            .iter()
            .enumerate()
            .map(|(tx_out_num, tx_out)| Self {
                tx_id: hex::encode(tx.id()),
                tx_out_num: tx_out_num as u32,
                value: tx_out.value,
                script: hex::encode(tx_out.script.to_u8_vec()),
                created_at: chrono::Utc::now().naive_utc(),
            })
            .collect()
    }
}
