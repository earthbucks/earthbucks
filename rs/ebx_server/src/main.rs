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
}
