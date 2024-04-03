#![allow(dead_code)] // TODO: remove this after launch

use impstack_lib::key::Key;
use impstack_lib::pub_key_hash;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: --key or --pub_key_hash");
        }
        2 => match args[1].as_str() {
            "--key" => {
                let key = Key::from_random();
                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
            }
            "--pub_key_hash" => {
                let key = Key::from_random();
                let public_key = key.public_key();
                let pub_key_hash = pub_key_hash::PubKeyHash::from_public_key(public_key.to_vec());

                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());
                let pub_key_hash_hex = hex::encode(pub_key_hash.pub_key_hash());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
                println!("PubKeyHash: {}", pub_key_hash_hex);
            }
            _ => {
                println!("Invalid argument. Please provide --key or --pub_key_hash");
            }
        },
        _ => {
            println!(
                "Too many arguments. Please provide only one argument: --key or --pub_key_hash"
            );
        }
    }
}
