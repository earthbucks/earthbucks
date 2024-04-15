use crate::db::db_tx_input::DbTxInput;
use crate::db::db_tx_output::DbTxOutput;
use ebx_lib::tx::Tx;
use sqlx::types::chrono;
use sqlx::Executor;

#[derive(Debug, sqlx::FromRow)]
pub struct DbTx {
    pub id: Vec<u8>,
    pub tx_buf: Vec<u8>,
    pub version: u8,
    pub tx_in_count: u32,
    pub tx_out_count: u32,
    pub lock_time: u64,
    pub is_valid: Option<bool>,
    pub is_vote_valid: Option<bool>,
    pub confirmed_block_id: Option<Vec<u8>>,
    pub confirmed_merkle_root: Option<Vec<u8>>,
    pub domain: String,
    pub ebx_address: Option<String>,
    pub created_at: chrono::NaiveDateTime,
}

impl DbTx {
    pub fn new(
        id: Vec<u8>,
        tx: Vec<u8>,
        version: u8,
        tx_in_count: u32,
        tx_out_count: u32,
        lock_time: u64,
        is_valid: Option<bool>,
        is_vote_valid: Option<bool>,
        confirmed_block_id: Option<Vec<u8>>,
        confirmed_merkle_root: Option<Vec<u8>>,
        domain: String,
        ebx_address: Option<String>,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            id,
            tx_buf: tx,
            version,
            lock_time,
            tx_in_count,
            tx_out_count,
            is_valid,
            is_vote_valid,
            confirmed_block_id,
            confirmed_merkle_root,
            domain,
            ebx_address,
            created_at,
        }
    }

    pub fn from_new_tx(tx: &Tx, domain: String, ebx_address: Option<String>) -> Self {
        Self {
            id: tx.id().to_vec(),
            tx_buf: tx.to_u8_vec(),
            version: tx.version,
            tx_in_count: tx.inputs.len() as u32,
            tx_out_count: tx.outputs.len() as u32,
            lock_time: tx.lock_time,
            is_valid: None,
            is_vote_valid: None,
            confirmed_block_id: None,
            confirmed_merkle_root: None,
            domain,
            ebx_address,
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_tx(&self) -> Result<Tx, Box<dyn std::error::Error>> {
        Tx::from_u8_vec(self.tx_buf.clone())
    }

    pub async fn get(id: &Vec<u8>, pool: &sqlx::MySqlPool) -> Result<DbTx, sqlx::Error> {
        let tx = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM tx WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(tx)
    }

    pub async fn insert_with_inputs_and_outputs(
        &self,
        pool: &sqlx::MySqlPool,
    ) -> Result<(), sqlx::Error> {
        let tx_buf = &self.tx_buf;
        let id = self.id.clone();
        let version = self.version;
        let tx_in_count = self.tx_in_count;
        let tx_out_count = self.tx_out_count;
        let lock_time = self.lock_time;
        let is_valid = self.is_valid;
        let is_vote_valid = self.is_vote_valid;
        let confirmed_block_id = self.confirmed_block_id.clone();
        let confirmed_merkle_root = self.confirmed_merkle_root.clone();
        let domain = self.domain.clone();
        let ebx_address = self.ebx_address.clone();
        let created_at = self.created_at;

        let tx_inputs = DbTxInput::from_tx(&self.to_tx().unwrap());
        let tx_outputs = DbTxOutput::from_tx(&self.to_tx().unwrap());

        let mut transaction = pool.begin().await?;

        // tx
        transaction
            .execute(
                sqlx::query(
                r#"
                INSERT INTO tx (id, tx_buf, version, tx_in_count, tx_out_count, lock_time, is_valid, is_vote_valid, confirmed_block_id, confirmed_merkle_root, domain, ebx_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                "#,
                )
                .bind(id)
                .bind(tx_buf)
                .bind(version)
                .bind(tx_in_count)
                .bind(tx_out_count)
                .bind(lock_time)
                .bind(is_valid)
                .bind(is_vote_valid)
                .bind(confirmed_block_id)
                .bind(confirmed_merkle_root)
                .bind(domain)
                .bind(ebx_address)
                .bind(created_at)
            ).await?;

        // tx_inputs
        for tx_input in tx_inputs {
            transaction
                .execute(
                    sqlx::query(
                    r#"
                    INSERT INTO tx_input (tx_id, tx_in_num, input_tx_id, input_tx_out_num, script, sequence, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    "#,
                    )
                    .bind(tx_input.tx_id)
                    .bind(tx_input.tx_in_num)
                    .bind(tx_input.input_tx_id)
                    .bind(tx_input.input_tx_out_num)
                    .bind(tx_input.script)
                    .bind(tx_input.sequence)
                    .bind(tx_input.created_at)
               ).await?;
        }

        // tx_outputs
        for tx_output in tx_outputs {
            transaction
                .execute(
                    sqlx::query(
                        r#"
                    INSERT INTO tx_output (tx_id, tx_out_num, value, script, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    "#,
                    )
                    .bind(tx_output.tx_id)
                    .bind(tx_output.tx_out_num)
                    .bind(tx_output.value)
                    .bind(tx_output.script)
                    .bind(tx_output.created_at),
                )
                .await?;
        }

        let res = transaction.commit().await?;

        Ok(res)
    }
}
