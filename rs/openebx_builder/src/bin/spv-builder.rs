use openebx_lib::key::Key;

fn main() {
    let key = Key::from_random();
    let priv_key = key.private_key;
    let priv_key_hex = hex::encode(priv_key);
    println!("Private key: {}", priv_key_hex);
}
