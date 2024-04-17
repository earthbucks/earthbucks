use ebx_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxParsed {
    pub id: String,
    pub version: u8,
    pub tx_in_count: u32,
    pub tx_out_count: u32,
    pub lock_time: u64,
    pub is_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub confirmed_block_id: Option<String>,
    pub confirmed_merkle_root: Option<String>,
    pub domain: String,
    pub ebx_address: Option<String>,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxParsed {
    pub fn new(
        id: String,
        version: u8,
        tx_in_count: u32,
        tx_out_count: u32,
        lock_time: u64,
        is_valid: Option<bool>,
        is_vote_valid: Option<bool>,
        confirmed_block_id: Option<String>,
        confirmed_merkle_root: Option<String>,
        domain: String,
        ebx_address: Option<String>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            id,
            version,
            lock_time,
            tx_in_count,
            tx_out_count,
            is_valid,
            is_vote_valid,
            confirmed_block_id,
            confirmed_merkle_root,
            domain,
            ebx_address,
            created_at,
        }
    }

    pub fn from_new_tx(tx: &Tx, domain: String, ebx_address: Option<String>) -> Self {
        Self {
            id: hex::encode(tx.id().to_vec()),
            version: tx.version,
            tx_in_count: tx.inputs.len() as u32,
            tx_out_count: tx.outputs.len() as u32,
            lock_time: tx.lock_time,
            is_valid: None,
            is_vote_valid: None,
            confirmed_block_id: None,
            confirmed_merkle_root: None,
            domain,
            ebx_address,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub async fn get(id: &String, pool: &sqlx::MySqlPool) -> Result<MineTxParsed, sqlx::Error> {
        let tx = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM mine_tx_parsed WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(tx)
    }
}
