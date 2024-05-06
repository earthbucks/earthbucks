use earthbucks_lib::merkle_proof::MerkleProof;
use sqlx::{types::chrono, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct MineMerkleProof {
    pub merkle_root: Vec<u8>,
    pub tx_id: Vec<u8>,
    pub merkle_proof: Vec<u8>,
    pub position: u64,
    pub created_at: chrono::NaiveDateTime,
}

impl MineMerkleProof {
    pub fn new(
        merkle_root: Vec<u8>,
        tx_id: Vec<u8>,
        merkle_proof: Vec<u8>,
        position: u64,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            merkle_root,
            tx_id,
            merkle_proof,
            position,
            created_at,
        }
    }

    pub fn from_merkle_proof(merkle_proof: &MerkleProof, tx_id: [u8; 32]) -> Self {
        Self {
            merkle_root: merkle_proof.root.to_vec(),
            tx_id: tx_id.to_vec(),
            merkle_proof: merkle_proof.to_iso_buf(),
            position: merkle_proof.position_in_tree(),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_merkle_proof(&self) -> MerkleProof {
        MerkleProof::from_iso_buf(&self.merkle_proof)
    }

    pub async fn get(
        merkle_root: Vec<u8>,
        tx_id: Vec<u8>,
        pool: &MySqlPool,
    ) -> Result<Self, sqlx::Error> {
        let result = sqlx::query_as::<_, Self>(
            "SELECT * FROM builder_merkle_proof WHERE merkle_root = ? AND tx_id = ?",
        )
        .bind(merkle_root)
        .bind(tx_id)
        .fetch_one(pool)
        .await?;

        Ok(result)
    }

    pub async fn get_all_for_merkle_root(
        merkle_root: Vec<u8>,
        pool: &MySqlPool,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let result = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM builder_merkle_proof
            WHERE merkle_root = ?
            ORDER BY position ASC
            "#,
        )
        .bind(merkle_root)
        .fetch_all(pool)
        .await?;

        Ok(result)
    }

    pub async fn upsert(&self, pool: &MySqlPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO builder_merkle_proof (merkle_root, tx_id, merkle_proof, position)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                merkle_proof = VALUES(merkle_proof),
                position = VALUES(position)
            "#,
        )
        .bind(&self.merkle_root)
        .bind(&self.tx_id)
        .bind(&self.merkle_proof)
        .bind(self.position)
        .execute(pool)
        .await?;
        Ok(())
    }
}
