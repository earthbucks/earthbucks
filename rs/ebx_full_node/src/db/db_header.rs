use ebx_lib::header::Header;
use sqlx::{types::chrono, Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct DbHeader {
    pub id: Vec<u8>,
    pub version: u32,
    pub prev_block_id: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub timestamp: u64,
    pub target: Vec<u8>,
    pub nonce: Vec<u8>,
    pub block_num: u64,
    pub is_work_valid: Option<bool>,
    pub is_block_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub domain: String,
    pub created_at: chrono::NaiveDateTime,
}

impl DbHeader {
    pub fn new(
        id: Vec<u8>,
        version: u32,
        prev_block_id: Vec<u8>,
        merkle_root: Vec<u8>,
        timestamp: u64,
        target: Vec<u8>,
        nonce: Vec<u8>,
        block_num: u64,
        is_work_valid: Option<bool>,
        is_block_valid: Option<bool>,
        is_vote_valid: Option<bool>,
        domain: String,
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
            is_work_valid,
            is_block_valid,
            is_vote_valid,
            domain,
            created_at,
        }
    }

    pub fn from_block_header(header: &Header, domain: String) -> Self {
        Self {
            id: header.id().try_into().unwrap(),
            version: header.version,
            prev_block_id: header.prev_block_id.try_into().unwrap(),
            merkle_root: header.merkle_root.try_into().unwrap(),
            timestamp: header.timestamp,
            target: header.target.try_into().unwrap(),
            nonce: header.nonce.try_into().unwrap(),
            block_num: header.block_num,
            is_work_valid: None,
            is_block_valid: None,
            is_vote_valid: None,
            domain,
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

    pub async fn get_candidate_headers(pool: &MySqlPool) -> Result<Vec<DbHeader>, Error> {
        let rows: Vec<DbHeader> = sqlx::query_as(
            r#"
            SELECT * FROM db_header
            WHERE is_work_valid IS NULL AND is_block_valid IS NULL AND is_vote_valid IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }

    pub async fn save(&self, pool: &MySqlPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            INSERT INTO db_header (id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, is_work_valid, is_block_valid, is_vote_valid, domain, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&self.id)
        .bind(self.version)
        .bind(&self.prev_block_id)
        .bind(&self.merkle_root)
        .bind(self.timestamp)
        .bind(&self.target)
        .bind(&self.nonce)
        .bind(self.block_num)
        .bind(self.is_work_valid)
        .bind(self.is_block_valid)
        .bind(self.is_vote_valid)
        .bind(&self.domain)
        .bind(self.created_at)
        .execute(pool)
        .await?;

        Ok(())
    }
}
