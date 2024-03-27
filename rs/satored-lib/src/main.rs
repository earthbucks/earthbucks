#![allow(dead_code)] // TODO: remove this after launch

use crate::key::Key;
use std::env;
mod address;
mod blake3;
mod buffer_reader;
mod key;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: --key or --address");
        }
        2 => match args[1].as_str() {
            "--key" => {
                let key = Key::from_random();
                let private_key_hex = key.private_key().to_string();
                let public_key_hex = key.public_key().to_string();

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
            }
            "--address" => {
                let key = Key::from_random();
                let public_key = key.public_key().serialize().to_vec();
                let address = address::Address::from_public_key(public_key);

                let private_key_hex = key.private_key().to_string();
                let public_key_hex = key.public_key().to_string();
                let address_hex = hex::encode(address.address());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
                println!("Address: {}", address_hex);
            }
            _ => {
                println!("Invalid argument. Please provide --key or --address");
            }
        },
        _ => {
            println!("Too many arguments. Please provide only one argument: --key or --address");
        }
    }
}
