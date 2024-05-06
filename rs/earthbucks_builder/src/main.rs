use anyhow::Result;
use dotenv::dotenv;
use earthbucks_builder::db::{
    builder_header::MineHeader, builder_lch::MineLch, builder_merkle_proof::MineMerkleProof,
    builder_tx_output::MineTxOutput, builder_tx_parsed::MineTxParsed, builder_tx_raw::MineTxRaw,
};
use earthbucks_lib::{
    block::Block, block_verifier::BlockVerifier, buffer::Buffer, domain::Domain, header::Header,
    header_chain::HeaderChain, key_pair::KeyPair, merkle_txs::MerkleTxs, pkh::Pkh,
    priv_key::PrivKey, pub_key::PubKey, script::Script, tx::Tx, tx_output::TxOutput,
    tx_output_map::TxOutputMap,
};

use log::{debug, error, info};
use signal_hook::consts::signal::{SIGINT, SIGTERM};
use signal_hook::iterator::Signals;
use sqlx::mysql::MySqlPool;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::{env, error::Error};
use tokio::time::{interval, Duration};

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
        let domain_priv_key: PrivKey = PrivKey::from_iso_str(&domain_priv_key_str)
            .map_err(|e| format!("Invalid domain priv key: {}", e))?;

        let domain_key_pair: KeyPair = KeyPair::from_priv_key(&domain_priv_key)
            .map_err(|e| format!("Invalid domain key pair: {}", e))?;

        let coinbase_pkh_str =
            env::var("COINBASE_PKH").map_err(|_| "Missing coinbase pkh".to_string())?;
        let coinbase_pkh: Pkh = Pkh::from_iso_str(&coinbase_pkh_str)
            .map_err(|e| format!("Invalid coinbase pkh: {}", e))?;

        let admin_pub_key_str =
            env::var("ADMIN_PUB_KEY").map_err(|_| "Missing admin pub key".to_string())?;
        let admin_pub_key: PubKey = PubKey::from_iso_str(&admin_pub_key_str)
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
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();

    let mut signals = Signals::new([SIGINT, SIGTERM])?;

    std::thread::spawn(move || {
        for _ in signals.forever() {
            r.store(false, Ordering::SeqCst);
        }
    });

    env_logger::init();
    let config = EnvConfig::new().unwrap();

    let pool = MySqlPool::connect(&config.database_url)
        .await
        .map_err(|e| anyhow::Error::msg(format!("Failed to connect to database: {}", e)))?;

    // TODO: Load adjustment chain (last 2016 blocks) instead of longest chain
    let mut longest_chain: HeaderChain = MineLch::get_longest_chain(&pool).await?;
    let mut building_block_num = longest_chain.headers.len();

    let mut interval = interval(Duration::from_secs(1));
    interval.tick().await;

    info!(
        "EarthBucks Builder: {}. Building block: {}.",
        config.domain, building_block_num
    );

    let mut loop_count: u64 = 0;

    'main_loop: loop {
        debug!(
            "Loop count: {}. Building block num: {}.",
            loop_count, building_block_num
        );
        loop_count += 1;

        // 1. Synchronize memory with longest chain from DB
        {
            if longest_chain.headers.is_empty() {
                longest_chain = MineLch::get_longest_chain(&pool).await?;
            } else {
                let db_chain_tip_id_opt: Option<Vec<u8>> = MineLch::get_chain_tip_id(&pool).await;
                if db_chain_tip_id_opt.is_none() {
                    log::error!("Longest chain in memory does not match database.");
                    anyhow::bail!("Longest chain in memory does not match database.")
                } else {
                    let db_chain_tip_id = db_chain_tip_id_opt.unwrap();
                    let mem_chain_tip_id = longest_chain.get_tip().unwrap().id();
                    if db_chain_tip_id != mem_chain_tip_id {
                        // TODO: Load only new block headers
                        longest_chain = MineLch::get_longest_chain(&pool).await?;
                    }
                }
            }

            let chain_length = longest_chain.headers.len();
            if chain_length != building_block_num {
                building_block_num = chain_length;
                info!("Building block: {}", building_block_num);
            }
        }

        // 2. Validate new block, broadcast, and vote.
        // TODO: Should there be a lock when validating a block?
        {
            let new_builder_headers = MineHeader::get_validated_headers(&pool).await?;
            debug!("New headers to verify: {}", new_builder_headers.len());
            for new_builder_header in &new_builder_headers {
                info!(
                    "Verifying block: {}",
                    hex::encode(new_builder_header.id.clone())
                );
                // 1. Get the merkle root from the header
                let header = new_builder_header.to_block_header();
                let merkle_root = header.merkle_root;
                let merkle_root = merkle_root.to_vec();

                // 2. Load all transactions from DB for this merkle root (in order)
                let builder_tx_raws =
                    MineTxRaw::get_for_all_merkle_root_in_order(merkle_root, &pool).await?;
                let txs: Vec<Tx> = builder_tx_raws.iter().map(|tx| tx.to_tx()).collect();

                // 3. Gather all (txid, txoutnum) from txs inputs so that we
                //    know which UTXOs to load from the DB.
                let tx_id_tx_out_num_tuples: Vec<(Vec<u8>, u32)> = txs
                    .iter()
                    .map(|tx| {
                        let tx_id = tx.id().to_vec();
                        let tx_out_num = 0;
                        (tx_id, tx_out_num)
                    })
                    .collect();

                // 4. Gather all unspent outputs matching (txid, txoutnum)
                let builder_tx_outputs: Vec<MineTxOutput> =
                    MineTxOutput::get_all_unspent_from_tx_ids_and_tx_out_nums(
                        &tx_id_tx_out_num_tuples,
                        &pool,
                    )
                    .await?;
                let mut tx_out_map = TxOutputMap::new();
                for builder_tx_output in &builder_tx_outputs {
                    let tx_id = builder_tx_output.tx_id.clone();
                    let tx_out_num = builder_tx_output.tx_out_num;
                    let tx_output = TxOutput::new(
                        builder_tx_output.value,
                        Script::from_iso_buf(&builder_tx_output.script).unwrap(),
                    );
                    tx_out_map.add(tx_output, &tx_id, tx_out_num);
                }

                // 5. Validate the block
                let block = Block::new(header.clone(), txs);
                let mut block_verifier = BlockVerifier::new(block, tx_out_map, &longest_chain);
                let is_block_valid = block_verifier.is_valid_now();
                info!("Block is valid: {}", is_block_valid);

                // 6. Update is_block_valid
                MineHeader::update_is_block_valid(&new_builder_header.id, is_block_valid, &pool)
                    .await?;
                info!(
                    "New validated block ID: {}",
                    Buffer::from(header.id().to_vec()).to_iso_hex()
                );
                if !is_block_valid {
                    continue;
                }

                // 7. TODO: Broadcast block

                // 8. TODO: Vote. If voted, mark as such.
                // if votes are valid, mark as such
                // TODO: Gather and assess votes
                // TODO: This should be a transaction
                let is_block_voted = true;
                MineHeader::update_is_vote_valid(&new_builder_header.id, is_block_voted, &pool)
                    .await?;
                let builder_lch = MineLch::from_builder_header(new_builder_header);
                let res = builder_lch.save(&pool).await;
                if let Err(e) = res {
                    error!("Failed to save new block header: {}", e);
                    anyhow::bail!("Failed to save new block header: {}", e)
                }
                info!("New longest chain tip ID: {}", hex::encode(builder_lch.id));
                if !is_block_voted {
                    continue;
                }

                // 9. TODO: Mark all used UTXOs as spent
                // 10. TODO: Mark all transactions as confirmed
                // 11. TODO: if voted, mark block as voted
            }
        }

        // 3. Check for valid PoW and continue main loop if found.
        {
            let new_builder_headers = MineHeader::get_candidate_headers(&pool).await?;
            // for each header, validate against the longest chain
            // if any header is valid, mark as such and continue main loop
            // if header is invalid, mark as such
            debug!("New candidate headers: {}", new_builder_headers.len());
            for new_builder_header in &new_builder_headers {
                let header = new_builder_header.to_block_header();
                if longest_chain.new_header_is_valid_now(&header) {
                    info!(
                        "New header is valid: {}, {}",
                        header.block_num,
                        Buffer::from(header.id().to_vec()).to_iso_hex()
                    );
                    MineHeader::update_is_header_valid(&new_builder_header.id, true, &pool).await?;
                    continue 'main_loop;
                } else {
                    debug!(
                        "Header is invalid: {}, {}",
                        header.block_num,
                        Buffer::from(header.id().to_vec()).to_iso_hex()
                    );
                    debug!(
                        "Header target: {}",
                        Buffer::from(header.target.to_vec()).to_iso_hex()
                    );
                    MineHeader::update_is_header_valid(&new_builder_header.id, false, &pool)
                        .await?;
                }
            }
        }

        // 4. Check for new transactions and validate. Broadcast if found.
        {}

        // 5. Create new candidate block header for mining.
        {
            // produce and insert coinbase transaction
            let coinbase_tx: Tx;
            {
                coinbase_tx = longest_chain
                    .get_next_coinbase_tx(&config.coinbase_pkh, &config.domain.clone());
                let coinbase_tx_id = coinbase_tx.id();
                debug!("Coinbase tx ID: {}", hex::encode(coinbase_tx_id));
                let coinbase_builder_tx = MineTxParsed::get(&coinbase_tx_id.to_vec(), &pool).await;
                if coinbase_builder_tx.is_err() {
                    info!("Inserting coinbase tx ID: {}", hex::encode(coinbase_tx_id));
                    let earthbucks_address: Option<String> = None;
                    let res_tx_id = MineTxRaw::parse_and_insert(
                        &coinbase_tx,
                        config.domain.clone(),
                        earthbucks_address,
                        &pool,
                    )
                    .await;
                    if let Err(e) = res_tx_id {
                        error!("Failed to insert coinbase tx: {}", e);
                        anyhow::bail!("Failed to insert coinbase tx: {}", e)
                    }
                } else {
                    debug!(
                        "Coinbase tx already exists: {}",
                        hex::encode(coinbase_tx_id)
                    );
                }
            }

            // TODO: Get (synchronize) all unconfirmed transactions (mempool)
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
                    // TODO: This should be a transaction
                    let builder_merkle_proof = MineMerkleProof::from_merkle_proof(proof, tx.id());
                    let res = builder_merkle_proof.upsert(&pool).await;
                    if let Err(e) = res {
                        error!("Failed to upsert merkle proof: {}", e);
                        anyhow::bail!("Failed to upsert merkle proof: {}", e)
                    }
                }
            }

            // Produce candidate header
            let new_timestamp = Header::get_new_timestamp();
            let header = match longest_chain.get_next_header(merkle_root, new_timestamp) {
                Ok(header) => header,
                Err(e) => {
                    error!("Failed to produce header: {}", e);
                    anyhow::bail!("Failed to produce header: {}", e)
                }
            };
            let block_id = header.id();

            // Save candidate header
            let builder_header = MineHeader::from_header(&header, config.domain.clone());
            let res = MineHeader::get(&builder_header.id, &pool).await;
            if res.is_ok() {
                // this can hypothetically happen if timestamp is the same
                debug!(
                    "Candidate header already exists: {}",
                    Buffer::from(block_id.to_vec()).to_iso_hex()
                );
            } else {
                builder_header.save(&pool).await?;
                debug!(
                    "Produced candidate header ID: {}",
                    Buffer::from(block_id.to_vec()).to_iso_hex()
                );
            }
        }

        // 6. Clean up old headers, merkle proofs, coinbase transactions, etc.
        {
            // Delete old unused block headers
            let res = MineHeader::delete_unused_headers(building_block_num as u64, &pool).await;
            if let Err(e) = res {
                error!("Failed to delete unused headers: {}", e);
                anyhow::bail!("Failed to delete unused headers: {}", e)
            } else {
                debug!(
                    "Deleted unused headers before block num: {}",
                    building_block_num
                );
            }
            // TODO: Delete old unused merkle proofs
            // TODO: Delete old unused coinbase transactions
            // TODO: Any other cleanup processes
        }

        // Check if Ctrl+C was pressed
        if !running.load(Ordering::SeqCst) {
            debug!("Termination signal detected, terminating...");
            break 'main_loop;
        }

        interval.tick().await;
    }

    Ok(())
}
