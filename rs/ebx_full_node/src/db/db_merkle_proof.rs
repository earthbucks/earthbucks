use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct DbMerkleProof {
    pub merkle_root: Vec<u8>,
    pub tx_id: Vec<u8>,
    pub merkle_proof: Vec<u8>,
    pub created_at: chrono::NaiveDateTime,
}

impl DbMerkleProof {
    pub fn new(
        merkle_root: Vec<u8>,
        tx_id: Vec<u8>,
        merkle_proof: Vec<u8>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            merkle_root,
            tx_id,
            merkle_proof,
            created_at,
        }
    }
}
