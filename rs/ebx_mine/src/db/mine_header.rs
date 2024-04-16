use ebx_lib::header::Header;
use sqlx::{types::chrono, Error, MySqlPool};

#[derive(Debug, sqlx::FromRow, Clone)]
pub struct MineHeader {
    pub id: String,
    pub version: u32,
    pub prev_block_id: String,
    pub merkle_root: String,
    pub timestamp: u64,
    pub target: String,
    pub nonce: String,
    pub block_num: u64,
    pub is_header_valid: Option<bool>,
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
        is_header_valid: Option<bool>,
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
            is_header_valid,
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
            is_header_valid: None,
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

    pub async fn get(id: &String, pool: &MySqlPool) -> Result<Self, Error> {
        let row: MineHeader = sqlx::query_as(
            r#"
            SELECT * FROM mine_header
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(row)
    }

    pub async fn get_candidate_headers(pool: &MySqlPool) -> Result<Vec<MineHeader>, Error> {
        let now_timestamp = Header::get_new_timestamp();
        let rows: Vec<MineHeader> = sqlx::query_as(
            r#"
            SELECT * FROM mine_header
            WHERE is_header_valid IS NULL AND is_block_valid IS NULL AND is_vote_valid IS NULL AND timestamp <= ?
            ORDER BY target ASC
            "#,
        )
        .bind(now_timestamp)
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }

    pub async fn get_validated_headers(pool: &MySqlPool) -> Result<Vec<MineHeader>, Error> {
        let rows: Vec<MineHeader> = sqlx::query_as(
            r#"
            SELECT * FROM mine_header
            WHERE is_header_valid = TRUE AND is_block_valid IS NULL AND is_vote_valid IS NULL
            ORDER BY target ASC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }

    pub async fn get_voting_headers(pool: &MySqlPool) -> Result<Vec<MineHeader>, Error> {
        let rows: Vec<MineHeader> = sqlx::query_as(
            r#"
            SELECT * FROM mine_header
            WHERE is_header_valid = TRUE AND is_block_valid = TRUE AND is_vote_valid IS NULL
            ORDER BY target ASC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }

    pub async fn save(&self, pool: &MySqlPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            INSERT INTO mine_header (id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, is_header_valid, is_block_valid, is_vote_valid, domain, created_at)
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
        .bind(self.is_header_valid)
        .bind(self.is_block_valid)
        .bind(self.is_vote_valid)
        .bind(&self.domain)
        .bind(self.created_at)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn update_is_header_valid(
        id: &String,
        is_header_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE mine_header
            SET is_header_valid = ?
            WHERE id = ?
            "#,
        )
        .bind(is_header_valid)
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn update_is_block_valid(
        id: &String,
        is_block_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE mine_header
            SET is_block_valid = ?
            WHERE id = ?
            "#,
        )
        .bind(is_block_valid)
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn update_is_vote_valid(
        id: &String,
        is_vote_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE mine_header
            SET is_vote_valid = ?
            WHERE id = ?
            "#,
        )
        .bind(is_vote_valid)
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }
}
