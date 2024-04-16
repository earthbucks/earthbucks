use ebx_lib::header::Header;
use ebx_lib::header_chain::HeaderChain;
use sqlx::types::chrono;
use sqlx::{Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct DbLch {
    pub id: String,
    pub version: u32,
    pub prev_block_id: String,
    pub merkle_root: String,
    pub timestamp: u64,
    pub target: String,
    pub nonce: String,
    pub block_num: u64,
    pub created_at: chrono::NaiveDateTime,
}

// longest chain header
impl DbLch {
    pub fn new(
        id: String,
        version: u32,
        prev_block_id: String,
        merkle_root: String,
        timestamp: u64,
        target: String,
        nonce: String,
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
            id: hex::encode(header.id()),
            version: header.version,
            prev_block_id: hex::encode(header.prev_block_id),
            merkle_root: hex::encode(header.merkle_root),
            timestamp: header.timestamp,
            target: hex::encode(header.target),
            nonce: hex::encode(header.nonce),
            block_num: header.block_num,
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

    pub async fn get(pool: &MySqlPool, id: Vec<u8>) -> Result<Self, Error> {
        let row: Self = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, created_at
            FROM db_lch
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get_longest_chain(pool: &MySqlPool) -> Result<HeaderChain, Error> {
        let rows: Vec<DbLch> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, created_at
            FROM db_lch
            ORDER BY block_num ASC
            "#,
        )
        .fetch_all(pool)
        .await?;
        let mut chain = HeaderChain::new();
        for row in rows {
            chain.add(row.to_block_header());
        }
        Ok(chain)
    }

    pub async fn get_chain_tip(pool: &MySqlPool) -> Result<Option<Header>, Error> {
        let row: Option<DbLch> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, created_at
            FROM db_lch
            ORDER BY block_num DESC
            LIMIT 1
            "#,
        )
        .fetch_optional(pool)
        .await?;
        match row {
            Some(row) => Ok(Some(row.to_block_header())),
            None => Ok(None),
        }
    }
}
