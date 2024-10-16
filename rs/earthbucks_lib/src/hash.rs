use earthbucks_blake3::hash;

pub fn blake3_hash(data: &[u8]) -> [u8; 32] {
  hash::blake3_hash(data).unwrap().try_into().unwrap()
}

pub fn double_blake3_hash(data: &[u8]) -> [u8; 32] {
    hash::double_blake3_hash(data).unwrap().try_into().unwrap()
}

pub fn blake3_mac(key: &[u8; 32], data: &[u8]) -> [u8; 32] {
  hash::blake3_mac(key, data).unwrap().try_into().unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::buf::EbxBuf;

    #[test]
    fn test_hash() {
        let pub_key_hex = "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
        let expected_pkh_hex = "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";
        let pub_key = Vec::<u8>::from_strict_hex(pub_key_hex).expect("Decoding failed");
        let expected_pkh_vec =
            Vec::<u8>::from_strict_hex(expected_pkh_hex).expect("Decoding failed");
        let mut expected_pkh = [0; 32];
        expected_pkh.copy_from_slice(&expected_pkh_vec[..]);
        let pkh = blake3_hash(&pub_key);
        let pkh_hex = pkh.to_strict_hex();
        let expected_pkh_hex = expected_pkh.to_strict_hex();
        assert_eq!(pkh_hex, expected_pkh_hex);
    }

    #[test]
    fn test_double_hash() {
        let pub_key_hex = "0341ee98513da8509fea0c89b81aca409e56f5aaa3076fb78233850ad0e54e2628";
        let expected_pkh_hex = "51544e51d07a92f41854bd2a14d0f33dcbc936b8910eb9c699b656cd89308132";
        let pub_key = Vec::<u8>::from_strict_hex(pub_key_hex).expect("Decoding failed");
        let expected_pkh_vec =
            Vec::<u8>::from_strict_hex(expected_pkh_hex).expect("Decoding failed");
        let mut expected_pkh = [0; 32];
        expected_pkh.copy_from_slice(&expected_pkh_vec[..]);
        let pkh = double_blake3_hash(&pub_key);
        let pkh_hex = pkh.to_strict_hex();
        let expected_pkh_hex = expected_pkh.to_strict_hex();
        assert_eq!(pkh_hex, expected_pkh_hex);
    }

    #[test]
    fn test_blake3_mac() {
        let key_str = "key".to_string();
        let key_data = key_str.as_bytes();
        let key = blake3_hash(key_data);
        let data_str = "data".to_string();
        let data = data_str.as_bytes();
        let mac = blake3_mac(&key, data);
        let expected_mac_hex = "438f903a8fc5997489497c30477dc32c5ece10f44049e302b85a83603960ec27";
        assert_eq!(mac.to_strict_hex(), expected_mac_hex);
    }
}
