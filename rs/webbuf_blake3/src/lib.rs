use blake3::Hasher;

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn blake3_hash(data: &[u8]) -> Result<Vec<u8>, String> {
    let mut hasher = Hasher::new();
    hasher.update(data);
    Ok(hasher.finalize().as_bytes().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn double_blake3_hash(data: &[u8]) -> Result<Vec<u8>, String> {
    let first_hash = blake3_hash(data)?;
    blake3_hash(&first_hash)
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn blake3_mac(key: &[u8], data: &[u8]) -> Result<Vec<u8>, String> {
    // Ensure the key is exactly 32 bytes
    let key32: [u8; 32] = key
        .try_into()
        .map_err(|_| "Key must be exactly 32 bytes".to_string())?;

    let mut hasher = Hasher::new_keyed(&key32);
    hasher.update(data);
    Ok(hasher.finalize().as_bytes().to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex::{decode, encode};

    #[test]
    fn test_hash() {
        let pub_key_hex = "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
        let expected_pkh_hex = "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";

        let pub_key = decode(pub_key_hex).expect("Decoding failed");
        let expected_pkh = decode(expected_pkh_hex).expect("Decoding failed");

        let pkh = blake3_hash(&pub_key).unwrap();
        let pkh_hex = encode(pkh);
        let expected_pkh_hex = encode(expected_pkh);

        assert_eq!(pkh_hex, expected_pkh_hex);
    }

    #[test]
    fn test_double_hash() {
        let pub_key_hex = "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628";
        let expected_pkh_hex = "51544e51d07a92f41854bd2a14d0f33dcbc936b8910eb9c699b656cd89308132";

        let pub_key = decode(pub_key_hex).expect("Decoding failed");
        let expected_pkh = decode(expected_pkh_hex).expect("Decoding failed");

        let pkh = double_blake3_hash(&pub_key).unwrap();
        let pkh_hex = encode(pkh);
        let expected_pkh_hex = encode(expected_pkh);

        assert_eq!(pkh_hex, expected_pkh_hex);
    }

    #[test]
    fn test_blake3_mac() {
        let key_str = "key";
        let key_data = key_str.as_bytes();
        let key = blake3_hash(key_data).unwrap();

        let data_str = "data";
        let data = data_str.as_bytes();
        let mac = blake3_mac(&key, data).unwrap();
        let expected_mac_hex = "438f903a8fc5997489497c30477dc32c5ece10f44049e302b85a83603960ec27";

        assert_eq!(encode(mac), expected_mac_hex);
    }
}
