use crate::db::builder_header::MineHeader;
use earthbucks_lib::header::Header;
use earthbucks_lib::header_chain::HeaderChain;
use sqlx::types::chrono;
use sqlx::{Error, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct MineLch {
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
    pub domain: String,
    pub created_at: chrono::NaiveDateTime,
}

// longest chain header
impl MineLch {
    pub fn from_builder_header(header: &MineHeader) -> Self {
        Self {
            id: header.id.clone(),
            version: header.version,
            prev_block_id: header.prev_block_id.clone(),
            merkle_root: header.merkle_root.clone(),
            timestamp: header.timestamp,
            block_num: header.block_num,
            target: header.target.clone(),
            nonce: header.nonce.clone(),
            work_algo: header.work_algo,
            work_ser: header.work_ser.clone(),
            work_par: header.work_par.clone(),
            domain: header.domain.clone(),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn from_block_header(header: &Header, domain: &str) -> Self {
        Self {
            id: header.id().to_vec(),
            version: header.version,
            prev_block_id: header.prev_block_id.to_vec(),
            merkle_root: header.merkle_root.to_vec(),
            timestamp: header.timestamp,
            target: header.target.to_vec(),
            nonce: header.nonce.to_vec(),
            block_num: header.block_num,
            work_algo: header.work_algo,
            work_ser: header.work_ser.to_vec(),
            work_par: header.work_par.to_vec(),
            domain: domain.to_string(),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_block_header(&self) -> Header {
        Header {
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

    pub async fn get(pool: &MySqlPool, id: Vec<u8>) -> Result<Self, Error> {
        let row: Self = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, block_num, target, nonce, work_algo, work_ser, work_par, domain, created_at
            FROM builder_lch
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
            SELECT id, version, prev_block_id, merkle_root, timestamp, block_num, target, nonce, work_algo, work_ser, work_par, domain, created_at
            FROM builder_lch
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
            SELECT id, version, prev_block_id, merkle_root, timestamp, block_num, target, nonce, work_algo, work_ser, work_par, domain, created_at
            FROM builder_lch
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
            INSERT INTO builder_lch (id, version, prev_block_id, merkle_root, timestamp, block_num, target, nonce, work_algo, work_ser, work_par, domain)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                version = VALUES(version),
                prev_block_id = VALUES(prev_block_id),
                merkle_root = VALUES(merkle_root),
                timestamp = VALUES(timestamp),
                block_num = VALUES(block_num),
                target = VALUES(target),
                nonce = VALUES(nonce),
                work_algo = VALUES(work_algo),
                work_ser = VALUES(work_ser),
                work_par = VALUES(work_par),
                domain = VALUES(domain)
            "#,
        )
        .bind(&self.id)
        .bind(self.version)
        .bind(&self.prev_block_id)
        .bind(&self.merkle_root)
        .bind(self.timestamp)
        .bind(self.block_num)
        .bind(&self.target)
        .bind(&self.nonce)
        .bind(self.work_algo)
        .bind(&self.work_ser)
        .bind(&self.work_par)
        .bind(&self.domain)
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn get_chain_tip_id(pool: &MySqlPool) -> Option<Vec<u8>> {
        let row: Result<Option<MineLch>, Error> = sqlx::query_as(
            r#"
            SELECT id, version, prev_block_id, merkle_root, timestamp, block_num, target, nonce, work_algo, work_ser, work_par, domain, created_at
            FROM builder_lch
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
