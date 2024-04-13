use ebx_lib::header::Header;
use sqlx::{types::chrono, Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct ModelHeader {
    pub id: Vec<u8>,
    pub version: u32,
    pub prev_block_id: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub timestamp: u64,
    pub target: Vec<u8>,
    pub nonce: Vec<u8>,
    pub block_num: u64,
    pub created_at: chrono::NaiveDateTime,
}

impl ModelHeader {
    pub fn new(
        id: Vec<u8>,
        version: u32,
        prev_block_id: Vec<u8>,
        merkle_root: Vec<u8>,
        timestamp: u64,
        target: Vec<u8>,
        nonce: Vec<u8>,
        block_num: u64,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            id,
            version,
            prev_block_id,
            merkle_root,
            timestamp,
            target,
            nonce,
            block_num,
            created_at,
        }
    }

    pub fn from_block_header(header: &Header) -> Self {
        Self {
            id: header.id().try_into().unwrap(),
            version: header.version,
            prev_block_id: header.prev_block_id.try_into().unwrap(),
            merkle_root: header.merkle_root.try_into().unwrap(),
            timestamp: header.timestamp,
            target: header.target.try_into().unwrap(),
            nonce: header.nonce.try_into().unwrap(),
            block_num: header.block_num,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_block_header(&self) -> Header {
        Header::new(
            self.version,
            self.prev_block_id.clone().try_into().unwrap(),
            self.merkle_root.clone().try_into().unwrap(),
            self.timestamp,
            self.target.clone().try_into().unwrap(),
            self.nonce.clone().try_into().unwrap(),
            self.block_num,
        )
    }

    pub async fn get_candidate_headers(pool: &MySqlPool) -> Result<Vec<ModelHeader>, Error> {
        // fetch all model_block_header
        let rows: Vec<ModelHeader> = sqlx::query_as(
            r#"
            SELECT * FROM header
            ORDER BY created_at DESC
            LIMIT 10
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }
}
