use anyhow::Result;
use dotenv::dotenv;
use ebx_full_node::db::{
    db_header::DbHeader, db_lch::DbLch, db_merkle_proof::DbMerkleProof, db_tx::DbTx,
};
use ebx_lib::{
    buffer::Buffer, domain::Domain, header::Header, header_chain::HeaderChain, key_pair::KeyPair,
    merkle_txs::MerkleTxs, pkh::Pkh, priv_key::PrivKey, pub_key::PubKey, tx::Tx,
};
use sqlx::{
    mysql::MySqlPool,
    types::chrono::{self},
};
use std::{env, error::Error};
use tokio::time::{interval, Duration};

#[macro_export]
macro_rules! log {
    ($($arg:tt)*) => ({
        let now = chrono::Utc::now().format("%Y-%m-%d");
        println!("[{}] {}", now, format!($($arg)*));
    })
}

#[allow(dead_code)] // TODO: remove before launch
struct EnvConfig {
    domain: String,
    domain_priv_key: PrivKey,
    domain_key_pair: KeyPair,
    coinbase_pkh: Pkh,
    admin_pub_key: PubKey,
    database_url: String,
}

impl EnvConfig {
    fn new() -> Result<Self, Box<dyn Error>> {
        dotenv().ok();

        let domain = env::var("DOMAIN")?;
        if !Domain::is_valid_domain(&domain) {
            return Err("Invalid domain".into());
        }

        let domain_priv_key_str =
            env::var("DOMAIN_PRIV_KEY").map_err(|_| "Missing domain priv key".to_string())?;
        let domain_priv_key: PrivKey = PrivKey::from_string(&domain_priv_key_str)
            .map_err(|e| format!("Invalid domain priv key: {}", e))?;

        let domain_key_pair: KeyPair = KeyPair::from_priv_key(&domain_priv_key)
            .map_err(|e| format!("Invalid domain key pair: {}", e))?;

        let coinbase_pkh_str =
            env::var("COINBASE_PKH").map_err(|_| "Missing coinbase pkh".to_string())?;
        let coinbase_pkh: Pkh = Pkh::from_string(&coinbase_pkh_str)
            .map_err(|e| format!("Invalid coinbase pkh: {}", e))?;

        let admin_pub_key_str =
            env::var("ADMIN_PUB_KEY").map_err(|_| "Missing admin pub key".to_string())?;
        let admin_pub_key: PubKey = PubKey::from_string(&admin_pub_key_str)
            .map_err(|e| format!("Invalid admin pub key: {}", e))?;

        let database_url =
            env::var("DATABASE_URL").map_err(|_| "Missing database URL".to_string())?;

        Ok(Self {
            domain,
            domain_priv_key,
            domain_key_pair,
            coinbase_pkh,
            admin_pub_key,
            database_url,
        })
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = EnvConfig::new().unwrap();

    let pool = MySqlPool::connect(&config.database_url)
        .await
        .map_err(|e| anyhow::Error::msg(format!("Failed to connect to database: {}", e)))?;

    let mut longest_chain: HeaderChain = DbLch::get_longest_chain(&pool).await?;
    let mut building_block_num = longest_chain.headers.len();

    let mut interval = interval(Duration::from_secs(1));

    log!("{} EBX Mine", config.domain);
    log!("Building block: {}", building_block_num);

    loop {
        interval.tick().await;

        // 1. Synchronize with longest chain
        {
            // TODO: Replace with synchronize, not re-load
            longest_chain = DbLch::get_longest_chain(&pool).await?;

            let chain_length = longest_chain.headers.len();
            if chain_length != building_block_num {
                building_block_num = chain_length;
                log!("Building block: {}", building_block_num);
            }
        }

        // 2. Check for new blocks and validate. Broadcast & continue if found.
        {
            // TODO: Check for new blocks
            // new block?
            //   validate work
            //   validate transactions
            //   broadcast block and assess votes
            //   if valid, add to longest chain and continue
            //   if invalid, punish miner
        }

        // 3. Check for new transactions and validate. Broadcast if found.
        {}

        // 4. Create new candidate block header for mining.
        {
            // produce and upsert coinbase transaction
            let coinbase_tx: Tx;
            {
                coinbase_tx = longest_chain
                    .get_next_coinbase_tx(&config.coinbase_pkh, &config.domain.clone());
                let db_raw_tx = DbTx::from_new_tx(&coinbase_tx, config.domain.clone(), None);
                let coinbase_tx_id = hex::encode(coinbase_tx.id().to_vec());
                log!("Coinbase tx ID:");
                log!("{}", coinbase_tx_id);
                let coinbase_db_tx = DbTx::get(&coinbase_tx_id, &pool).await;
                if let Err(_) = coinbase_db_tx {
                    log!("Inserting coinbase tx: {}", coinbase_tx_id);
                    let res = db_raw_tx.insert_with_inputs_and_outputs(&pool).await;
                    if let Err(e) = res {
                        anyhow::bail!("Failed to insert coinbase tx:\n{}", e);
                    }
                } else {
                    log!("Coinbase tx already exists:");
                    log!("{}", coinbase_tx_id);
                }
            }

            // TODO: Get (synchronize) all unconfirmed transactions (pmempool)
            let mempool_txs: Vec<Tx> = vec![];

            // combine coinbase and mempool transactions
            let unconfirmed_txs: Vec<Tx> =
                vec![coinbase_tx].into_iter().chain(mempool_txs).collect();

            // Produce Merkle root and Merkle proofs
            let merkle_txs = MerkleTxs::new(unconfirmed_txs);
            let merkle_root: [u8; 32] = merkle_txs.root;

            // Save all Merkle proofs (upsert)
            {
                for (tx, proof) in merkle_txs.get_iterator() {
                    let db_merkle_proof =
                        DbMerkleProof::from_merkle_proof(&proof, tx.id().to_vec());
                    let res = db_merkle_proof.upsert(&pool).await;
                    if let Err(e) = res {
                        anyhow::bail!("Failed to upsert merkle proof: {}", e);
                    }
                }
            }

            // Produce candidate block header
            let new_timestamp = Header::get_new_timestamp();
            let header = match longest_chain.get_next_header(merkle_root, new_timestamp) {
                Ok(header) => header,
                Err(e) => {
                    anyhow::bail!("Failed to produce block header: {}", e);
                }
            };
            let block_id = header.id();

            // Save candidate block header
            let db_header = DbHeader::from_block_header(&header, config.domain.clone());
            db_header.save(&pool).await?;

            log!("Produced candidate block header ID:");
            log!("{}", Buffer::from(block_id.to_vec()).to_hex());
        }

        // 5. Check for valid PoW and write block if found.
        {
            let new_headers = DbHeader::get_candidate_headers(&pool).await?;
            if !new_headers.is_empty() {
                log!("New block headers: {}", new_headers.len());
                anyhow::bail!("Not yet implemented");
            }
        }

        // TODO: Delete old unused block headers
        // TODO: Any other cleanup processes
    }
}
