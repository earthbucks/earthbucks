use crate::key::Key;
use std::env;
mod key;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: --key or --address");
        }
        2 => {
            match args[1].as_str() {
                "--key" => {
                    // Your code to print keys
                    let key = Key::from_random();
                    let private_key_hex = key.private_key().to_string();
                    let public_key_hex = key.public_key().to_string();

                    println!("Private key: {}", private_key_hex);
                    println!("Public key: {}", public_key_hex);
                }
                "--address" => {
                    // Your code to print addresses
                    println!("Address functionality is not implemented yet.");
                }
                _ => {
                    println!("Invalid argument. Please provide --key or --address");
                }
            }
        }
        _ => {
            println!("Too many arguments. Please provide only one argument: --key or --address");
        }
    }
}
