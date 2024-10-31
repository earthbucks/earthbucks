use crate::hash::blake3_mac;
use earthbucks_secp256k1::secp256k1;
use crate::priv_key::PrivKey;
use crate::pub_key::PubKey;

pub fn sign(data: &[u8], priv_key: PrivKey) -> [u8; 64] {
    let key = priv_key.buf;
    let k = blake3_mac(&key, data);
    let sig = secp256k1::sign(data, &key, &k)
        .map_err(|_| "Failed to sign")
        .unwrap();
    sig.try_into().unwrap()
}

pub fn verify(data: &[u8], sig: &[u8; 64], pubkey: &[u8; 33]) -> bool {
    let res = secp256k1::verify(data, sig, pubkey);
    res.is_ok()
}
