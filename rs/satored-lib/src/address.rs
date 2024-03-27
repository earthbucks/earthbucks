use crate::blake3::hash;

pub struct Address {
    address: [u8; 32],
}

impl Address {
    pub fn new(public_key: Vec<u8>) -> Self {
        let address = hash(&public_key);
        Self { address }
    }

    pub fn from_public_key(public_key: Vec<u8>) -> Self {
        Self::new(public_key)
    }

    pub fn address(&self) -> &[u8; 32] {
        &self.address
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex;
    use serde::Deserialize;
    use std::fs;

    #[test]
    fn test_address() {
        let pub_key_hex = "03d03a42c710b7cf9085bd3115338f72b86f2d77859b6afe6d33b13ea8957a9722";
        let expected_address_hex =
            "38a12c6cf034632042b3b9deb2aabfdc798fac879d2f833638d59cf58549bc2d";

        // Convert hex to bytes
        let pub_key = hex::decode(pub_key_hex).expect("Decoding failed");
        let expected_address_vec = hex::decode(expected_address_hex).expect("Decoding failed");

        // Convert Vec<u8> to [u8; 32]
        let mut expected_address = [0; 32];
        expected_address.copy_from_slice(&expected_address_vec[..]);

        // Create a new Address instance
        let address = Address::new(pub_key);

        // Check that the address matches the expected address
        assert_eq!(address.address(), &expected_address);
    }

    #[derive(Deserialize)]
    struct AddressData {
        address: Vec<AddressPair>,
    }

    #[derive(Deserialize)]
    struct AddressPair {
        pub_key: String,
        address: String,
    }

    #[test]
    fn test_address_pairs() {
        // Read the JSON file
        let data = fs::read_to_string("../../json/address.json").expect("Unable to read file");

        // Parse the JSON data
        let address_data: AddressData = serde_json::from_str(&data).expect("Unable to parse JSON");

        for pair in address_data.address {
            // Convert hex to bytes
            let pub_key = hex::decode(&pair.pub_key).expect("Decoding failed");
            let expected_address_vec = hex::decode(&pair.address).expect("Decoding failed");

            // Convert Vec<u8> to [u8; 32]
            let mut expected_address = [0; 32];
            expected_address.copy_from_slice(&expected_address_vec[..]);

            // Create a new Address instance
            let address = Address::new(pub_key);

            // Check that the address matches the expected address
            assert_eq!(address.address(), &expected_address);
        }
    }
}
