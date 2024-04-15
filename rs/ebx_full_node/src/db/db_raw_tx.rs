use ebx_lib::tx::Tx;
use sqlx::{types::chrono, MySqlPool};

#[derive(Debug, sqlx::FromRow)]
pub struct DbRawTx {
    pub id: Vec<u8>,
    pub tx: Vec<u8>,
    pub is_parsed: bool,
    pub domain: String,
    pub ebx_address: Option<String>,
    pub created_at: chrono::NaiveDateTime,
}

impl DbRawTx {
    pub fn new(
        id: Vec<u8>,
        tx: Vec<u8>,
        is_parsed: bool,
        domain: String,
        ebx_address: Option<String>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            id,
            tx,
            is_parsed,
            domain,
            ebx_address,
            created_at,
        }
    }

    pub async fn upsert(&self, pool: &MySqlPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO raw_tx (id, tx, is_parsed, domain, ebx_address)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                tx = VALUES(tx),
                is_parsed = VALUES(is_parsed),
                domain = VALUES(domain),
                ebx_address = VALUES(ebx_address)
            "#,
        )
        .bind(&self.id)
        .bind(&self.tx)
        .bind(self.is_parsed)
        .bind(&self.domain)
        .bind(&self.ebx_address)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get(id: Vec<u8>, pool: &MySqlPool) -> Result<DbRawTx, sqlx::Error> {
        let result = sqlx::query_as::<_, DbRawTx>("SELECT * FROM raw_tx WHERE id = ?")
            .bind(id)
            .fetch_one(pool)
            .await?;

        Ok(result)
    }

    pub fn from_tx(tx: &Tx, domain: String) -> Self {
        Self {
            id: tx.id().to_vec(),
            tx: tx.to_u8_vec(),
            is_parsed: false,
            domain,
            ebx_address: None,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub async fn save(&self, pool: &MySqlPool) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO raw_tx (id, tx, is_parsed, domain, ebx_address)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            tx = VALUES(tx),
            is_parsed = VALUES(is_parsed),
            domain = VALUES(domain),
            ebx_address = VALUES(ebx_address)
            "#,
        )
        .bind(&self.id)
        .bind(&self.tx)
        .bind(self.is_parsed)
        .bind(&self.domain)
        .bind(&self.ebx_address)
        .execute(pool)
        .await?;

        Ok(())
    }
}
