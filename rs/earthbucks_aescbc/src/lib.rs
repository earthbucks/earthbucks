use aes::cipher::generic_array::GenericArray;
use aes::cipher::{BlockDecrypt, BlockEncrypt, KeyInit};
use aes::{Aes128, Aes192, Aes256}; // Import AES with different key sizes

pub enum AesKeySize {
    Aes128,
    Aes192,
    Aes256,
}

pub fn aes_encrypt(key: &[u8], data: &[u8]) -> Vec<u8> {
    match key.len() {
        16 => {
            let cipher = Aes128::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.encrypt_block(block);
            block.to_vec()
        }
        24 => {
            let cipher = Aes192::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.encrypt_block(block);
            block.to_vec()
        }
        32 => {
            let cipher = Aes256::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.encrypt_block(block);
            block.to_vec()
        }
        _ => panic!("Invalid key size: expected 16, 24, or 32 bytes"),
    }
}

pub fn aes_decrypt(key: &[u8], data: &[u8]) -> Vec<u8> {
    match key.len() {
        16 => {
            let cipher = Aes128::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.decrypt_block(block);
            block.to_vec()
        }
        24 => {
            let cipher = Aes192::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.decrypt_block(block);
            block.to_vec()
        }
        32 => {
            let cipher = Aes256::new(GenericArray::from_slice(key));
            let mut data = data.to_vec();
            let block = GenericArray::from_mut_slice(&mut data);
            cipher.decrypt_block(block);
            block.to_vec()
        }
        _ => panic!("Invalid key size: expected 16, 24, or 32 bytes"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        // Define a 32-byte key and a 16-byte plaintext (AES block size is 16 bytes)
        let key = [0u8; 32]; // 32 bytes (256 bits) for AES-256
        let plaintext = [0u8; 16]; // A block of 16 bytes (128 bits)

        // Encrypt the plaintext
        let encrypted = aes_encrypt(&key, &plaintext);

        // Decrypt the encrypted text
        let decrypted = aes_decrypt(&key, &encrypted);

        // Check if the decrypted text matches the original plaintext
        assert_eq!(
            decrypted,
            plaintext.to_vec(),
            "Decrypted data does not match the original plaintext"
        );
    }

    #[test]
    fn test_encrypt_not_equal_to_plaintext() {
        // Define a 32-byte key and a 16-byte plaintext
        let key = [0u8; 32];
        let plaintext = [0u8; 16];

        // Encrypt the plaintext
        let encrypted = aes_encrypt(&key, &plaintext);

        // Check that the encrypted text is not the same as the plaintext
        assert_ne!(
            encrypted,
            plaintext.to_vec(),
            "Encrypted data should not be equal to the original plaintext"
        );
    }

    #[test]
    fn test_different_keys_produce_different_ciphertexts() {
        // Define two different keys
        let key1 = [0u8; 32];
        let key2 = [1u8; 32];
        let plaintext = [0u8; 16];

        // Encrypt the same plaintext with two different keys
        let encrypted1 = aes_encrypt(&key1, &plaintext);
        let encrypted2 = aes_encrypt(&key2, &plaintext);

        // Check that the encrypted texts are different
        assert_ne!(
            encrypted1, encrypted2,
            "Encrypting with different keys should produce different ciphertexts"
        );
    }

    #[test]
    fn test_encrypt_decrypt_128_bit_key() {
        // Define a 16-byte key (128 bits) and a 16-byte plaintext (AES block size is 16 bytes)
        let key = [0u8; 16]; // 16 bytes (128 bits) for AES-128
        let plaintext = [0u8; 16]; // A block of 16 bytes (128 bits)

        // Encrypt the plaintext
        let encrypted = aes_encrypt(&key, &plaintext);

        // Decrypt the encrypted text
        let decrypted = aes_decrypt(&key, &encrypted);

        // Check if the decrypted text matches the original plaintext
        assert_eq!(
            decrypted,
            plaintext.to_vec(),
            "Decrypted data does not match the original plaintext"
        );
    }

    #[test]
    fn test_encrypt_decrypt_192_bit_key() {
        // Define a 24-byte key (192 bits) and a 16-byte plaintext
        let key = [0u8; 24]; // 24 bytes (192 bits) for AES-192
        let plaintext = [0u8; 16]; // A block of 16 bytes (128 bits)

        // Encrypt the plaintext
        let encrypted = aes_encrypt(&key, &plaintext);

        // Decrypt the encrypted text
        let decrypted = aes_decrypt(&key, &encrypted);

        // Check if the decrypted text matches the original plaintext
        assert_eq!(
            decrypted,
            plaintext.to_vec(),
            "Decrypted data does not match the original plaintext"
        );
    }

    #[test]
    fn test_encrypt_decrypt_256_bit_key() {
        // Define a 32-byte key (256 bits) and a 16-byte plaintext
        let key = [0u8; 32]; // 32 bytes (256 bits) for AES-256
        let plaintext = [0u8; 16]; // A block of 16 bytes (128 bits)

        // Encrypt the plaintext
        let encrypted = aes_encrypt(&key, &plaintext);

        // Decrypt the encrypted text
        let decrypted = aes_decrypt(&key, &encrypted);

        // Check if the decrypted text matches the original plaintext
        assert_eq!(
            decrypted,
            plaintext.to_vec(),
            "Decrypted data does not match the original plaintext"
        );
    }
}
