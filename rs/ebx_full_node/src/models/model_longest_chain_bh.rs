use ebx_lib::block_header::BlockHeader;
use ebx_lib::header_chain::HeaderChain;
use sqlx::types::chrono;
use sqlx::{Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct ModelLongestChainBh {
    pub id: Vec<u8>,
    pub version: u32,
    pub prev_block_id: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub timestamp: u64,
    pub target: Vec<u8>,
    pub nonce: Vec<u8>,
    pub n_block: u64,
    pub created_at: chrono::NaiveDateTime,
}

impl ModelLongestChainBh {
    pub fn new(
        id: Vec<u8>,
        version: u32,
        prev_block_id: Vec<u8>,
        merkle_root: Vec<u8>,
        timestamp: u64,
        target: Vec<u8>,
        nonce: Vec<u8>,
        n_block: u64,
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
            n_block,
            created_at,
        }
    }

    pub fn from_block_header(header: &BlockHeader) -> Self {
        Self {
            id: header.id().try_into().unwrap(),
            version: header.version,
            prev_block_id: header.prev_block_id.try_into().unwrap(),
            merkle_root: header.merkle_root.try_into().unwrap(),
            timestamp: header.timestamp,
            target: header.target.try_into().unwrap(),
            nonce: header.nonce.try_into().unwrap(),
            n_block: header.n_block,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_block_header(&self) -> BlockHeader {
        BlockHeader::new(
            self.version,
            self.prev_block_id.clone().try_into().unwrap(),
            self.merkle_root.clone().try_into().unwrap(),
            self.timestamp,
            self.target.clone().try_into().unwrap(),
            self.nonce.clone().try_into().unwrap(),
            self.n_block,
        )
    }

    pub async fn get(pool: &MySqlPool, id: Vec<u8>) -> Result<Self, Error> {
        let row: Self = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, n_block, created_at
            FROM longest_chain_bh
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;
        Ok(row)
    }

    pub async fn get_longest_chain(pool: &MySqlPool) -> Result<HeaderChain, Error> {
        let rows: Vec<ModelLongestChainBh> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, target, nonce, n_block, created_at
            FROM longest_chain_bh
            ORDER BY n_block ASC
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
}
