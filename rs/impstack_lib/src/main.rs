#![allow(dead_code)] // TODO: remove this after launch

use impstack_lib::address;
use impstack_lib::key::Key;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: --key or --address");
        }
        2 => match args[1].as_str() {
            "--key" => {
                let key = Key::from_random();
                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
            }
            "--address" => {
                let key = Key::from_random();
                let public_key = key.public_key();
                let address = address::Address::from_public_key(public_key.to_vec());

                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());
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
