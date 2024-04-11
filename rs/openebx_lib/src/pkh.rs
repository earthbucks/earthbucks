use crate::blake3::double_blake3_hash;

pub struct Pkh {
    pub pkh: [u8; 32],
}

impl Pkh {
    pub fn new(public_key: Vec<u8>) -> Self {
        let pkh = double_blake3_hash(&public_key);
        Self { pkh }
    }

    pub fn from_public_key(public_key: Vec<u8>) -> Self {
        Self::new(public_key)
    }

    pub fn pkh(&self) -> &[u8; 32] {
        &self.pkh
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
        let pub_key_hex = "0317fab5ac778e983f2ccd9faadc1524e1e3a49623d28e1a73309bf9d0fb72b53d";
        let expected_address_hex =
            "601c2893ab7febcf1b3b43e91d98360966f52c98d8f98f29be52ece37b1cff84";

        // Convert hex to bytes
        let pub_key = hex::decode(pub_key_hex).expect("Decoding failed");
        let expected_address_vec = hex::decode(expected_address_hex).expect("Decoding failed");

        // Convert Vec<u8> to [u8; 32]
        let mut expected_address = [0; 32];
        expected_address.copy_from_slice(&expected_address_vec[..]);

        // Create a new Address instance
        let address = Pkh::new(pub_key);

        // Check that the address matches the expected address
        assert_eq!(address.pkh(), &expected_address);
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
            let address = Pkh::new(pub_key);

            // Check that the address matches the expected address
            assert_eq!(address.pkh(), &expected_address);
        }
    }
}
