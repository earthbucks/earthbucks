use dotenv::dotenv;
use ebx_lib::key::Key;
use std::env;

fn main() {
    dotenv().ok();

    for (key, value) in env::vars() {
        println!("{}: {}", key, value);
    }

    let key = Key::from_random();
    let priv_key = key.private_key;
    let priv_key_hex = hex::encode(priv_key);
    println!("Private key: {}", priv_key_hex);

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
}
