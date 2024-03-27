use blake3::Hasher;

pub fn hash(data: &[u8]) -> [u8; 32] {
  let mut hasher = Hasher::new();
  hasher.update(data);
  hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex;

    #[test]
    fn test_hash() {
        let pub_key_hex = "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
        let expected_address_hex = "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";

        // Convert hex to bytes
        let pub_key = hex::decode(pub_key_hex).expect("Decoding failed");
        let expected_address_vec = hex::decode(expected_address_hex).expect("Decoding failed");

        // Convert Vec<u8> to [u8; 32]
        let mut expected_address = [0; 32];
        expected_address.copy_from_slice(&expected_address_vec[..]);

        // Compute the hash of the public key
        let address = hash(&pub_key);

        // Convert the address to hex
        let address_hex = hex::encode(address);

        // Convert the expected address to hex
        let expected_address_hex = hex::encode(expected_address);

        // Check that the computed address matches the expected address
        assert_eq!(address_hex, expected_address_hex);
    }
}