use anyhow::Result;
use dotenv::dotenv;
use ebx_full_node::models::{
    model_block_header::ModelBlockHeader, model_longest_chain_bh::ModelLongestChainBh,
};
use ebx_lib::{
    block_header::BlockHeader, buffer::Buffer, domain::Domain, header_chain::HeaderChain,
    key_pair::KeyPair, merkle_txs::MerkleTxs, pkh::Pkh, priv_key::PrivKey, pub_key::PubKey,
    script::Script, script_chunk::ScriptChunk, script_num::ScriptNum, tx::Tx,
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

    let mut longest_chain: HeaderChain = ModelLongestChainBh::get_longest_chain(&pool).await?;
    let mut building_block_n = longest_chain.headers.len();

    let mut interval = interval(Duration::from_secs(1));

    log!("OpenEBX Full Node Builder for {}", config.domain);
    log!("Building block: {}", building_block_n);

    loop {
        interval.tick().await;

        // TODO: Replace with synchronize, not re-load
        longest_chain = ModelLongestChainBh::get_longest_chain(&pool).await?;

        let chain_length = longest_chain.headers.len();
        if chain_length != building_block_n {
            building_block_n = chain_length;
            log!("Building block: {}", building_block_n);
        }

        // TODO: Verify block
        // new block?
        //   validate work
        //   validate transactions
        //   add block to longest chain or reorg
        //   broadcast block
        let new_block_headers = ModelBlockHeader::get_candidate_headers(&pool).await?;
        if !new_block_headers.is_empty() {
            log!("New block headers: {}", new_block_headers.len());
            anyhow::bail!("Not yet implemented");
        }

        // produce coinbase transaction
        let script_num = ScriptNum::from_usize(building_block_n);
        let script_data = script_num.to_u8_vec();
        let script_chunk = ScriptChunk::from_data(script_data);
        let input_script = Script::new(vec![script_chunk]);
        let output_script = Script::from_pkh_output(&config.coinbase_pkh.pkh);
        let output_amount = BlockHeader::coinbase_amount(building_block_n as u64);
        let coinbase_tx = Tx::from_coinbase(input_script, output_script, output_amount);

        // produce candidate block header
        let merkle_txs = MerkleTxs::new(vec![coinbase_tx]);
        let merkle_root: [u8; 32] = merkle_txs.root.try_into().unwrap();
        let block_header = longest_chain
            .get_new_block_header(merkle_root)
            .map_err(|e| anyhow::Error::msg(format!("Failed to produce block header: {}", e)))?;
        let block_id = block_header.id();

        // log!("Block header: {:?}", block_header.to_string());
        log!("Block ID: {}", Buffer::from(block_id.to_vec()).to_hex());
    }
}
