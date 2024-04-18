use crate::db::mine_header::MineHeader;
use ebx_lib::header::Header;
use ebx_lib::header_chain::HeaderChain;
use sqlx::types::chrono;
use sqlx::{Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct MineLch {
    pub id: String,
    pub version: u32,
    pub prev_block_id: String,
    pub merkle_root: String,
    pub timestamp: u64,
    pub target: String,
    pub nonce: String,
    pub block_num: u64,
    pub domain: String,
    pub created_at: chrono::NaiveDateTime,
}

// longest chain header
impl MineLch {
    pub fn from_mine_header(header: &MineHeader) -> Self {
        Self {
            id: header.id.clone(),
            version: header.version,
            prev_block_id: header.prev_block_id.clone(),
            merkle_root: header.merkle_root.clone(),
            timestamp: header.timestamp,
            target: header.target.clone(),
            nonce: header.nonce.clone(),
            block_num: header.block_num,
            domain: header.domain.clone(),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn from_block_header(header: &Header, domain: &str) -> Self {
        Self {
            id: hex::encode(header.id()),
            version: header.version,
            prev_block_id: hex::encode(header.prev_block_id),
            merkle_root: hex::encode(header.merkle_root),
            timestamp: header.timestamp,
            target: hex::encode(header.target),
            nonce: hex::encode(header.nonce),
            block_num: header.block_num,
            domain: domain.to_string(),
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
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, domain, created_at
            FROM mine_lch
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get_longest_chain(pool: &MySqlPool) -> Result<HeaderChain, Error> {
        let rows: Vec<MineLch> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, domain, created_at
            FROM mine_lch
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
        let row: Option<MineLch> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, domain, created_at
            FROM mine_lch
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

    pub async fn save(&self, pool: &MySqlPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            INSERT INTO mine_lch (id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, domain)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                version = VALUES(version),
                prev_block_id = VALUES(prev_block_id),
                merkle_root = VALUES(merkle_root),
                timestamp = VALUES(timestamp),
                target = VALUES(target),
                nonce = VALUES(nonce),
                block_num = VALUES(block_num),
                domain = VALUES(domain)
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
        .bind(&self.domain)
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn get_chain_tip_id(pool: &MySqlPool) -> Option<String> {
        let row: Result<Option<MineLch>, Error> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, domain, created_at
            FROM mine_lch
            ORDER BY block_num DESC
            LIMIT 1
            "#,
        )
        .fetch_optional(pool)
        .await;
        match row {
            Ok(Some(row)) => Some(row.id),
            _ => None,
        }
    }
}
