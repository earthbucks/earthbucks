use anyhow::Result;
use dotenv::dotenv;
use ebx_full_node::models::model_longest_chain_bh::ModelLongestChainBh;
use ebx_lib::{
    domain::Domain, header_chain::HeaderChain, key_pair::KeyPair, priv_key::PrivKey,
    pub_key::PubKey,
};
use sqlx::mysql::MySqlPool;
use std::{env, error::Error};
use tokio::time::{interval, Duration};

struct EnvConfig {
    domain: String,
    domain_priv_key: PrivKey,
    domain_key_pair: KeyPair,
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
            admin_pub_key,
            database_url,
        })
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = EnvConfig::new().unwrap();
    println!("DOMAIN: {}", config.domain);
    println!("DOMAIN_PRIV_KEY: {}", config.domain_priv_key.to_string());
    println!("DOMAIN_PRIV_KEY: {}", config.domain_key_pair.to_string());
    println!("ADMIN_PUB_KEY: {}", config.admin_pub_key.to_string());

    let pool = MySqlPool::connect(&config.database_url)
        .await
        .map_err(|e| anyhow::Error::msg(format!("Failed to connect to database: {}", e)))?;

    let longest_chain: HeaderChain = ModelLongestChainBh::get_longest_chain(&pool)
        .await
        .unwrap_or_else(|_| HeaderChain::new());
    // let chain_tip_buf: Option<[u8; 32]> = None;
    // let mempool: Vec<Tx> = Vec::new();

    let mut interval = interval(Duration::from_secs(1));

    println!("OpenEBX Full Node Builder started.");
    loop {
        println!("...awaiting...");
        interval.tick().await;
        let chain_length = longest_chain.headers.len();
        println!("Chain length: {}", chain_length);
        // - get the longest (validated) chain
        // - if chain tip has changed:
        //   - validate new chain
        //   - if new chain is valid:
        //     - broadcast new chain
        //     - if reorg:
        //       - perform reorg
        //     - continue
        //   - else:
        //     - penalize nodes that broadcasted invalid chain
        //     - continue
        // - else (chain tip hasn't changed):
        //   - if valid PoW has been found:
        //     - add block to chain and broadcast
        //     - continue
        //   - else if unconfirmed transaction set is changed:
        //     - get all transactions not in the longest chain (unconfirmed transactions)
        //     - compute merkle root of unconfirmed transactions
        //     - build block header with correct merkle root - but (probably) insufficient difficulty
        //     - await new PoW from users
        //     - build block with PoW
        //     - broadcast block
        //     - continue
        //   - else:
        //     - continue
    }
}
