use ebx_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct DbTxOutput {
    pub tx_id: Vec<u8>,
    pub tx_out_num: u32,
    pub value: u64,
    pub script: Vec<u8>,
    pub created_at: chrono::NaiveDateTime,
}

impl DbTxOutput {
    pub fn new(
        tx_id: Vec<u8>,
        tx_out_num: u32,
        value: u64,
        script: Vec<u8>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            tx_id,
            tx_out_num,
            value,
            script,
            created_at,
        }
    }

    pub fn from_tx(tx: &Tx) -> Vec<Self> {
        tx.outputs
            .iter()
            .enumerate()
            .map(|(tx_out_num, tx_out)| Self {
                tx_id: tx.id().to_vec(),
                tx_out_num: tx_out_num as u32,
                value: tx_out.value,
                script: tx_out.script.to_u8_vec(),
                created_at: chrono::Utc::now().naive_utc(),
            })
            .collect()
    }
}
