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
    // get the longest (validated) chain
    // get all transactions not in the longest chain (unconfirmed transactions)
    // compute merkle root of unconfirmed transactions
    // build block header with correct merkle root - but (probably) insufficient difficulty
    // await new PoW from users
    // build block with PoW
    // broadcast block
}
