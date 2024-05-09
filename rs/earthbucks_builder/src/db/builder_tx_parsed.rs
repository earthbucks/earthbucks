use earthbucks_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxParsed {
    pub id: Vec<u8>,
    pub version: u8,
    pub tx_in_count: u32,
    pub tx_out_count: u32,
    pub lock_num: u64,
    pub is_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub confirmed_block_id: Option<Vec<u8>>,
    pub confirmed_merkle_root: Option<Vec<u8>>,
    pub domain: String,
    pub earthbucks_address: Option<String>,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxParsed {
    pub fn from_new_tx(tx: &Tx, domain: String, earthbucks_address: Option<String>) -> Self {
        Self {
            id: tx.id().to_vec(),
            version: tx.version,
            tx_in_count: tx.inputs.len() as u32,
            tx_out_count: tx.outputs.len() as u32,
            lock_num: tx.abs_lock,
            is_valid: None,
            is_vote_valid: None,
            confirmed_block_id: None,
            confirmed_merkle_root: None,
            domain,
            earthbucks_address,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub async fn get(id: &Vec<u8>, pool: &sqlx::MySqlPool) -> Result<MineTxParsed, sqlx::Error> {
        let tx = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM builder_tx_parsed WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(tx)
    }
}
