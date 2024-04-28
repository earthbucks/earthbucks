use earthbucks_lib::header::Header;
use sqlx::{types::chrono, Error, MySqlPool};

#[derive(Debug, sqlx::FromRow, Clone)]
pub struct MineHeader {
    pub id: Vec<u8>,
    pub version: u32,
    pub prev_block_id: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub timestamp: u64,
    pub block_num: u64,
    pub target: Vec<u8>,
    pub nonce: Vec<u8>,
    pub work_algo: u64,
    pub work_ser: Vec<u8>,
    pub work_par: Vec<u8>,
    pub is_header_valid: Option<bool>,
    pub is_block_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub domain: String,
    pub created_at: chrono::NaiveDateTime,
}

impl MineHeader {
    pub fn from_header(header: &Header, domain: String) -> Self {
        Self {
            id: header.id().to_vec(),
            version: header.version,
            prev_block_id: header.prev_block_id.to_vec(),
            merkle_root: header.merkle_root.to_vec(),
            timestamp: header.timestamp,
            block_num: header.block_num,
            target: header.target.to_vec(),
            nonce: header.nonce.to_vec(),
            work_algo: header.work_algo,
            work_ser: header.work_ser.to_vec(),
            work_par: header.work_par.to_vec(),
            is_header_valid: None,
            is_block_valid: None,
            is_vote_valid: None,
            domain,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_block_header(&self) -> Header {
        Header{
            version: self.version,
            prev_block_id: self.prev_block_id.clone().try_into().unwrap(),
            merkle_root: self.merkle_root.clone().try_into().unwrap(),
            timestamp: self.timestamp,
            block_num: self.block_num,
            target: self.target.clone().try_into().unwrap(),
            nonce: self.nonce.clone().try_into().unwrap(),
            work_algo: self.work_algo,
            work_ser: self.work_ser.clone().try_into().unwrap(),
            work_par: self.work_par.clone().try_into().unwrap(),
        }
    }

    pub async fn get(id: &Vec<u8>, pool: &MySqlPool) -> Result<Self, Error> {
        let row: MineHeader = sqlx::query_as(
            r#"
            SELECT * FROM builder_header
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
            SELECT * FROM builder_header
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
            SELECT * FROM builder_header
            WHERE
                is_header_valid = TRUE
                AND (is_block_valid IS NULL OR is_block_valid = false)
                AND is_vote_valid IS NULL
            ORDER BY target ASC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(rows)
    }

    // pub async fn get_voting_headers(pool: &MySqlPool) -> Result<Vec<MineHeader>, Error> {
    //     let rows: Vec<MineHeader> = sqlx::query_as(
    //         r#"
    //         SELECT * FROM builder_header
    //         WHERE is_header_valid = TRUE AND is_block_valid = TRUE AND is_vote_valid IS NULL
    //         ORDER BY target ASC
    //         "#,
    //     )
    //     .fetch_all(pool)
    //     .await?;

    //     Ok(rows)
    // }

    pub async fn save(&self, pool: &MySqlPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            INSERT INTO builder_header (id, version, prev_block_id, merkle_root, timestamp, target, nonce, block_num, is_header_valid, is_block_valid, is_vote_valid, domain, created_at)
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
        id: &Vec<u8>,
        is_header_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE builder_header
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
        id: &Vec<u8>,
        is_block_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE builder_header
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
        id: &Vec<u8>,
        is_vote_valid: bool,
        pool: &MySqlPool,
    ) -> Result<(), Error> {
        sqlx::query(
            r#"
            UPDATE builder_header
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

    pub async fn delete_unused_headers(block_num: u64, pool: &MySqlPool) -> Result<(), Error> {
        sqlx::query(
            r#"
            DELETE FROM builder_header
            WHERE block_num < ? AND (is_header_valid IS NULL OR is_header_valid = FALSE)
            "#,
        )
        .bind(block_num)
        .execute(pool)
        .await?;

        Ok(())
    }
}
