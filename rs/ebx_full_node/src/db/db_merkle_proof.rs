use ebx_lib::merkle_proof::MerkleProof;
use sqlx::{types::chrono, MySqlPool};

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

    pub fn from_merkle_proof(merkle_proof: &MerkleProof, tx_id: Vec<u8>) -> Self {
        Self {
            merkle_root: merkle_proof.root.to_vec(),
            tx_id,
            merkle_proof: merkle_proof.to_u8_vec(),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_merkle_proof(&self) -> MerkleProof {
        MerkleProof::from_u8_vec(&self.merkle_proof)
    }

    pub async fn get(
        merkle_root: Vec<u8>,
        tx_id: Vec<u8>,
        pool: &MySqlPool,
    ) -> Result<DbMerkleProof, sqlx::Error> {
        let result = sqlx::query_as::<_, DbMerkleProof>(
            "SELECT * FROM merkle_proof WHERE merkle_root = ? AND tx_id = ?",
        )
        .bind(merkle_root)
        .bind(tx_id)
        .fetch_one(pool)
        .await?;

        Ok(result)
    }

    pub async fn upsert(&self, pool: &MySqlPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO merkle_proof (merkle_root, tx_id, merkle_proof)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                merkle_proof = VALUES(merkle_proof)
            "#,
        )
        .bind(&self.merkle_root)
        .bind(&self.tx_id)
        .bind(&self.merkle_proof)
        .execute(pool)
        .await?;
        Ok(())
    }
}
