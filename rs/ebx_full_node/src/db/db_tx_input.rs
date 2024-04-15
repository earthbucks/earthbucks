use ebx_lib::tx::Tx;
use sqlx::types::chrono;

#[derive(Debug, sqlx::FromRow)]
pub struct DbTxInput {
    pub tx_id: String,
    pub tx_in_num: u32,
    pub input_tx_id: String,
    pub input_tx_out_num: u32,
    pub script: String,
    pub sequence: u32,
    pub created_at: chrono::NaiveDateTime,
}

impl DbTxInput {
    pub fn new(
        tx_id: String,
        tx_in_num: u32,
        input_tx_id: String,
        input_tx_out_num: u32,
        script: String,
        sequence: u32,
        created_at: chrono::NaiveDateTime,
    ) -> Self {
        Self {
            tx_id,
            tx_in_num,
            input_tx_id,
            input_tx_out_num,
            script,
            sequence,
            created_at,
        }
    }

    pub fn from_tx(tx: &Tx) -> Vec<Self> {
        tx.inputs
            .iter()
            .enumerate()
            .map(|(tx_in_num, tx_in)| Self {
                tx_id: hex::encode(tx.id().to_vec()),
                tx_in_num: tx_in_num as u32,
                input_tx_id: hex::encode(tx_in.input_tx_id.to_vec()),
                input_tx_out_num: tx_in.input_tx_out_num as u32,
                script: hex::encode(tx_in.script.to_u8_vec()),
                sequence: tx_in.sequence,
                created_at: chrono::Utc::now().naive_utc(),
            })
            .collect()
    }
}
