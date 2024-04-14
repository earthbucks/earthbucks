use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct DbTx {
    pub id: Vec<u8>,
    pub tx: Vec<u8>,
    pub version: u8,
    pub lock_time: u64,
    pub tx_in_count: u32,
    pub tx_out_count: u32,
    pub is_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub confirmed_block_id: Option<Vec<u8>>,
    pub confirmed_merkle_root: Option<Vec<u8>>,
    pub created_at: chrono::NaiveDateTime,
}

impl DbTx {
    pub fn new(
        id: Vec<u8>,
        tx: Vec<u8>,
        version: u8,
        lock_time: u64,
        tx_in_count: u32,
        tx_out_count: u32,
        is_valid: Option<bool>,
        is_vote_valid: Option<bool>,
        confirmed_block_id: Option<Vec<u8>>,
        confirmed_merkle_root: Option<Vec<u8>>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            id,
            tx,
            version,
            lock_time,
            tx_in_count,
            tx_out_count,
            is_valid,
            is_vote_valid,
            confirmed_block_id,
            confirmed_merkle_root,
            created_at,
        }
    }
}
