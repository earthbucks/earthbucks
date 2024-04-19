use earthbucks_lib::key_pair::KeyPair;
use earthbucks_lib::pkh;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    match args.len() {
        1 => {
            println!("Please provide an argument: key or pkh");
        }
        2 => match args[1].as_str() {
            "key" => {
                let key = KeyPair::from_random();
                let private_key_hex = key.priv_key.to_hex();
                let public_key_hex = key.pub_key.to_hex();

                println!("Private key: {}", private_key_hex);
                println!("Public key: {}", public_key_hex);
            }
            "pkh" => {
                let key = KeyPair::from_random();
                let public_key = key.pub_key.buf;
                let pkh = pkh::Pkh::from_pub_key_buf(public_key.to_vec());

                let private_key_hex = key.priv_key.to_hex();
                let public_key_hex = key.pub_key.to_hex();
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
