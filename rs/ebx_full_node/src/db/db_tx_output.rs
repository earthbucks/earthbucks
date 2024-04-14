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
}
