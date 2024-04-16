use ebx_lib::header::Header;
use sqlx::{types::chrono, Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct MineHeader {
    pub id: String,
    pub version: u32,
    pub prev_block_id: String,
    pub merkle_root: String,
    pub timestamp: u64,
    pub target: String,
    pub nonce: String,
    pub block_num: u64,
    pub is_work_valid: Option<bool>,
    pub is_block_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub domain: String,
    pub created_at: chrono::NaiveDateTime,
}

impl MineHeader {
    pub fn new(
        id: String,
        version: u32,
        prev_block_id: String,
        merkle_root: String,
        timestamp: u64,
        target: String,
        nonce: String,
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
            id: hex::encode(header.id()),
            version: header.version,
            prev_block_id: hex::encode(header.prev_block_id),
            merkle_root: hex::encode(header.merkle_root),
            timestamp: header.timestamp,
            target: hex::encode(header.target),
            nonce: hex::encode(header.nonce),
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
            hex::decode(&self.prev_block_id)
                .unwrap()
                .try_into()
                .unwrap(),
            hex::decode(&self.merkle_root).unwrap().try_into().unwrap(),
            self.timestamp,
            hex::decode(&self.target).unwrap().try_into().unwrap(),
            hex::decode(&self.nonce).unwrap().try_into().unwrap(),
            self.block_num,
        )
    }

    pub async fn get_candidate_headers(pool: &MySqlPool) -> Result<Vec<MineHeader>, Error> {
        let rows: Vec<MineHeader> = sqlx::query_as(
            r#"
            SELECT * FROM mine_header
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
            INSERT INTO mine_header (id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, is_work_valid, is_block_valid, is_vote_valid, domain, created_at)
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
