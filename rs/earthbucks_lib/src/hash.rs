use blake3::Hasher;

pub fn blake3_hash(data: &[u8]) -> [u8; 32] {
    let mut hasher = Hasher::new();
    hasher.update(data);
    hasher.finalize().into()
}

pub fn double_blake3_hash(data: &[u8]) -> [u8; 32] {
    blake3_hash(&blake3_hash(data))
}

pub fn blake3_mac(key: &[u8; 32], data: &[u8]) -> [u8; 32] {
    let mut hasher = Hasher::new_keyed(key);
    hasher.update(data);
    hasher.finalize().into()
}
