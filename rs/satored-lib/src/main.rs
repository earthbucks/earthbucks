use crate::key::Key;
mod key;

fn main() {
    let key = Key::from_random();
    let private_key_hex = key.private_key().to_string();
    let public_key_hex = key.public_key().to_string();

    println!("Private key: {}", private_key_hex);
    println!("Public key: {}", public_key_hex);
}