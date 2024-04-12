use dotenv::dotenv;
use ebx_lib::domain::Domain;
use std::{env, error::Error};

struct EnvConfig {
    domain: String,
    domain_priv_key: String,
    admin_pub_key: String,
}

impl EnvConfig {
    fn new() -> Result<Self, Box<dyn Error>> {
        dotenv().ok();

        let domain = env::var("EBX_DOMAIN")?;
        if !Domain::is_valid_domain(&domain) {
            return Err("Invalid domain".into());
        }

        let domain_priv_key = env::var("EBX_DOMAIN_PRIV_KEY")?;
        let admin_pub_key = env::var("EBX_ADMIN_PUB_KEY")?;

        Ok(Self {
            domain,
            domain_priv_key,
            admin_pub_key,
        })
    }
}

fn main() {
    // load config
    // memory: longest chain (headers of validated blocks)
    // memory: longest chain tip ("chain tip")
    // memory: unconfirmed transactions ("mempool")
    // poll db every 1 second
    //   - get the longest (validated) chain
    //   - if chain tip has changed:
    //     - validate new chain
    //     - if new chain is valid:
    //       - broadcast new chain
    //       - if reorg:
    //         - perform reorg
    //       - continue
    //     - else:
    //       - penalize nodes that broadcasted invalid chain
    //       - continue
    //   - else (chain tip hasn't changed):
    //     - if valid PoW has been found:
    //       - add block to chain and broadcast
    //       - continue
    //     - else if unconfirmed transaction set is changed:
    //       - get all transactions not in the longest chain (unconfirmed transactions)
    //       - compute merkle root of unconfirmed transactions
    //       - build block header with correct merkle root - but (probably) insufficient difficulty
    //       - await new PoW from users
    //       - build block with PoW
    //       - broadcast block
    //       - continue
    //     - else:
    //       - continue
    let config = EnvConfig::new().unwrap();
    println!("EBX_DOMAIN: {}", config.domain);
    println!("EBX_DOMAIN_PRIV_KEY: {}", config.domain_priv_key);
    println!("EBX_ADMIN_PUB_KEY: {}", config.admin_pub_key);
}
