use ebx_lib::block_header::BlockHeader;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct ModelBlockHeader {
    pub id: [u8; 32],
    pub version: u32,
    pub prev_block_id: [u8; 32],
    pub merkle_root: [u8; 32],
    pub timestamp: u64,
    pub target: [u8; 32],
    pub nonce: [u8; 32],
    pub n_block: u64,
    pub created_at: chrono::NaiveDateTime,
}

impl ModelBlockHeader {
    pub fn new(
        id: [u8; 32],
        version: u32,
        prev_block_id: [u8; 32],
        merkle_root: [u8; 32],
        timestamp: u64,
        target: [u8; 32],
        nonce: [u8; 32],
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
            id: header.id(),
            version: header.version,
            prev_block_id: header.prev_block_id,
            merkle_root: header.merkle_root,
            timestamp: header.timestamp,
            target: header.target,
            nonce: header.nonce,
            n_block: header.n_block,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_block_header(&self) -> BlockHeader {
        BlockHeader::new(
            self.version,
            self.prev_block_id,
            self.merkle_root,
            self.timestamp,
            self.target,
            self.nonce,
            self.n_block,
        )
    }
}
