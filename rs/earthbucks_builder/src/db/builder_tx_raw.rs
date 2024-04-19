use crate::db::builder_tx_input::MineTxInput;
use crate::db::builder_tx_output::MineTxOutput;
use crate::db::builder_tx_parsed;
use earthbucks_lib::tx::Tx;
use sqlx::types::chrono;
use sqlx::Executor;

#[derive(Debug, sqlx::FromRow)]
pub struct MineTxRaw {
    pub id: String,
    pub tx_raw: String,
    pub created_at: chrono::NaiveDateTime,
}

impl MineTxRaw {
    pub fn from_tx(tx: &Tx) -> Self {
        Self {
            id: hex::encode(tx.id()),
            tx_raw: hex::encode(tx.to_u8_vec()),
            created_at: chrono::Utc::now().naive_utc(),
        }
    }

    pub fn to_tx(&self) -> Tx {
        Tx::from_u8_vec(hex::decode(&self.tx_raw).unwrap()).unwrap()
    }

    pub async fn get_for_all_merkle_root_in_order(
        merkle_root_hex: String,
        pool: &sqlx::MySqlPool,
    ) -> Result<Vec<Self>, sqlx::Error> {
        let builder_tx_raws: Vec<MineTxRaw> = sqlx::query_as::<_, Self>(
            r#"
            SELECT * FROM builder_tx_raw
            WHERE id IN (
                SELECT tx_id FROM builder_merkle_proof
                WHERE merkle_root = ?
            )
            ORDER BY (
                SELECT position FROM builder_merkle_proof
                WHERE builder_tx_raw.id = builder_merkle_proof.tx_id
            )
            "#,
        )
        .bind(merkle_root_hex)
        .fetch_all(pool)
        .await?;

        Ok(builder_tx_raws)
    }

    pub async fn parse_and_insert(
        tx: &Tx,
        domain: String,
        earthbucks_address: Option<String>,
        pool: &sqlx::MySqlPool,
    ) -> Result<String, sqlx::Error> {
        let builder_tx_parsed =
            builder_tx_parsed::MineTxParsed::from_new_tx(tx, domain.clone(), earthbucks_address.clone());
        let tx_raw_hex = tx.to_hex();
        let id = &builder_tx_parsed.id.clone();
        let version = builder_tx_parsed.version;
        let tx_in_count = builder_tx_parsed.tx_in_count;
        let tx_out_count = builder_tx_parsed.tx_out_count;
        let lock_num = builder_tx_parsed.lock_num;
        let is_valid = builder_tx_parsed.is_valid;
        let is_vote_valid = builder_tx_parsed.is_vote_valid;
        let confirmed_block_id = builder_tx_parsed.confirmed_block_id.clone();
        let confirmed_merkle_root = builder_tx_parsed.confirmed_merkle_root.clone();
        let domain = builder_tx_parsed.domain.clone();
        let earthbucks_address = builder_tx_parsed.earthbucks_address.clone();
        let created_at = builder_tx_parsed.created_at;

        let tx_inputs = MineTxInput::from_tx(tx);
        let tx_outputs = MineTxOutput::from_tx(tx);

        let mut transaction = pool.begin().await?;

        // tx_raw
        transaction
            .execute(
                sqlx::query(
                    r#"
              INSERT INTO builder_tx_raw (id, tx_raw, created_at)
              VALUES (?, ?, ?)
              "#,
                )
                .bind(id)
                .bind(tx_raw_hex)
                .bind(created_at),
            )
            .await?;

        // tx_parsed
        transaction
          .execute(
              sqlx::query(
              r#"
              INSERT INTO builder_tx_parsed (id, version, tx_in_count, tx_out_count, lock_num, is_valid, is_vote_valid, confirmed_block_id, confirmed_merkle_root, domain, earthbucks_address, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              "#,
              )
              .bind(id)
              .bind(version)
              .bind(tx_in_count)
              .bind(tx_out_count)
              .bind(lock_num)
              .bind(is_valid)
              .bind(is_vote_valid)
              .bind(confirmed_block_id)
              .bind(confirmed_merkle_root)
              .bind(domain)
              .bind(earthbucks_address)
              .bind(created_at)
          ).await?;

        // tx_inputs
        for tx_input in tx_inputs {
            transaction
              .execute(
                  sqlx::query(
                  r#"
                  INSERT INTO builder_tx_input (tx_id, tx_in_num, input_tx_id, input_tx_out_num, script, sequence, created_at)
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
                  INSERT INTO builder_tx_output (tx_id, tx_out_num, value, script, created_at)
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
