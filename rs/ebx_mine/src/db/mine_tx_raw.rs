use crate::db::mine_tx_input::MineTxInput;
use crate::db::mine_tx_output::MineTxOutput;
use crate::db::mine_tx_parsed;
use ebx_lib::tx::Tx;
use sqlx::types::chrono;
use sqlx::Executor;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxRaw {
    pub id: String,
    pub tx_raw: String,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxRaw {
    pub fn new(id: String, tx_raw: String, created_at: chrono::NaiveDateTime) -> Self {
        Self {
            id,
            tx_raw,
            created_at,
        }
    }

    pub fn from_tx(tx: &Tx) -> Self {
        Self {
            id: hex::encode(tx.id().to_vec()),
            tx_raw: hex::encode(tx.to_u8_vec()),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_tx(&self) -> Tx {
        Tx::from_u8_vec(hex::decode(&self.tx_raw).unwrap()).unwrap()
    }

    pub async fn parse_and_insert(
        tx: &Tx,
        domain: String,
        ebx_address: Option<String>,
        pool: &sqlx::MySqlPool,
    ) -> Result<String, sqlx::Error> {
        let mine_tx_parsed =
            mine_tx_parsed::MineTxParsed::from_new_tx(tx, domain.clone(), ebx_address.clone());
        let tx_raw_hex = tx.to_hex();
        let id = &mine_tx_parsed.id.clone();
        let version = mine_tx_parsed.version;
        let tx_in_count = mine_tx_parsed.tx_in_count;
        let tx_out_count = mine_tx_parsed.tx_out_count;
        let lock_time = mine_tx_parsed.lock_time;
        let is_valid = mine_tx_parsed.is_valid;
        let is_vote_valid = mine_tx_parsed.is_vote_valid;
        let confirmed_block_id = mine_tx_parsed.confirmed_block_id.clone();
        let confirmed_merkle_root = mine_tx_parsed.confirmed_merkle_root.clone();
        let domain = mine_tx_parsed.domain.clone();
        let ebx_address = mine_tx_parsed.ebx_address.clone();
        let created_at = mine_tx_parsed.created_at;

        let tx_inputs = MineTxInput::from_tx(&tx);
        let tx_outputs = MineTxOutput::from_tx(&tx);

        let mut transaction = pool.begin().await?;

        // tx_raw
        transaction
            .execute(
                sqlx::query(
                    r#"
              INSERT INTO mine_tx_raw (id, tx_raw, created_at)
              VALUES (?, ?, ?)
              "#,
                )
                .bind(&id)
                .bind(tx_raw_hex)
                .bind(created_at),
            )
            .await?;

        // tx_parsed
        transaction
          .execute(
              sqlx::query(
              r#"
              INSERT INTO mine_tx_parsed (id, version, tx_in_count, tx_out_count, lock_time, is_valid, is_vote_valid, confirmed_block_id, confirmed_merkle_root, domain, ebx_address, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              "#,
              )
              .bind(&id)
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
                  INSERT INTO mine_tx_input (tx_id, tx_in_num, input_tx_id, input_tx_out_num, script, sequence, created_at)
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
                  INSERT INTO mine_tx_output (tx_id, tx_out_num, value, script, created_at)
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

        transaction.commit().await?;

        Ok(id.to_string())
    }
}
