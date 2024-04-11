use ebx_lib::key::Key;
use ebx_lib::pkh;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: key or pkh");
        }
        2 => match args[1].as_str() {
            "key" => {
                let key = Key::from_random();
                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
            }
            "pkh" => {
                let key = Key::from_random();
                let public_key = key.public_key();
                let pkh = pkh::Pkh::from_public_key(public_key.to_vec());

                let private_key_hex = hex::encode(key.private_key());
                let public_key_hex = hex::encode(key.public_key());
                let pkh_hex = hex::encode(pkh.pkh());

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
                println!("Address: {}", pkh_hex);
            }
            _ => {
                println!("Invalid argument. Please provide key or pkh");
            }
        },
        _ => {
            println!("Too many arguments. Please provide only one argument: key or pkh");
        }
    }
}
