use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct DbTxInput {
    pub tx_id: Vec<u8>,
    pub tx_in_num: u32,
    pub input_tx_id: Vec<u8>,
    pub input_tx_out_num: u32,
    pub script: Vec<u8>,
    pub sequence: u32,
    pub created_at: chrono::NaiveDateTime,
}

impl DbTxInput {
    pub fn new(
        tx_id: Vec<u8>,
        tx_in_num: u32,
        input_tx_id: Vec<u8>,
        input_tx_out_num: u32,
        script: Vec<u8>,
        sequence: u32,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            tx_id,
            tx_in_num,
            input_tx_id,
            input_tx_out_num,
            script,
            sequence,
            created_at,
        }
    }
}
