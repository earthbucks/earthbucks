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
                let priv_key_str = key.priv_key.to_str();
                let pub_key_str = key.pub_key.to_str();

                println!("Private key: {}", priv_key_str);
                println!("Public key: {}", pub_key_str);
            }
            "pkh" => {
                let key = KeyPair::from_random();
                let public_key = key.pub_key.buf;
                let pkh = pkh::Pkh::from_pub_key_buffer(public_key.to_vec());

                let prv_key_str = key.priv_key.to_str();
                let pub_key_str = key.pub_key.to_str();
                let pkh_str = pkh.to_str();

                println!("Private key: {}", prv_key_str);
                println!("Public key: {}", pub_key_str);
                println!("Address: {}", pkh_str);
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
