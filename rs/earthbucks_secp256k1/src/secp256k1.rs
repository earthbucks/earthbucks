use k256::{
    elliptic_curve::{
        ops::{Invert, Mul, MulByGenerator, Reduce},
        point::AffineCoordinates,
        scalar::FromUintUnchecked,
        sec1::ToEncodedPoint,
        Curve, NonZeroScalar,
    },
    FieldBytes, ProjectivePoint, PublicKey, Scalar, Secp256k1, SecretKey, U256,
};

#[cfg(feature = "wasm")]
use wasm_bindgen::prelude::*; // Import wasm-bindgen only if the 'wasm' feature is enabled

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn private_key_verify(priv_key_buf: &[u8]) -> bool {
    if priv_key_buf.len() != 32 {
        return false;
    }
    SecretKey::from_slice(priv_key_buf).is_ok()
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn public_key_verify(pub_key_buf: &[u8]) -> bool {
    // Check if the public key length is correct (33 bytes for compressed format)
    if pub_key_buf.len() != 33 {
        return false;
    }

    // Try to parse the public key and return whether it's valid
    PublicKey::from_sec1_bytes(pub_key_buf).is_ok()
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn public_key_create(priv_key_buf: &[u8]) -> Result<Vec<u8>, String> {
    if priv_key_buf.len() != 32 {
        return Err("Invalid private key: must be exactly 32 bytes".to_string());
    }
    if priv_key_buf.iter().all(|&b| b == 0) {
        return Err("Invalid private key: cannot be all zeros".to_string());
    }

    let secret_key =
        SecretKey::from_slice(priv_key_buf).map_err(|_| "Invalid private key".to_string())?;
    let secret_scalar = secret_key.to_nonzero_scalar();
    let public_key = PublicKey::from_secret_scalar(&secret_scalar);
    Ok(public_key.to_encoded_point(true).as_bytes().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn private_key_add(priv_key_buf_1: &[u8], priv_key_buf_2: &[u8]) -> Result<Vec<u8>, String> {
    if priv_key_buf_1.len() != 32 || priv_key_buf_2.len() != 32 {
        return Err("Private keys must be exactly 32 bytes".to_string());
    }

    let secret_key_1 = SecretKey::from_slice(priv_key_buf_1)
        .map_err(|_| "Invalid first private key".to_string())?;
    let secret_key_2 = SecretKey::from_slice(priv_key_buf_2)
        .map_err(|_| "Invalid second private key".to_string())?;

    let new_secret_scalar = secret_key_1
        .to_nonzero_scalar()
        .add(&secret_key_2.to_nonzero_scalar());

    let new_secret_key = SecretKey::from_bytes(&new_secret_scalar.to_bytes())
        .map_err(|_| "Failed to create new private key".to_string())?;

    Ok(new_secret_key.to_bytes().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn public_key_add(pub_key_buf_1: &[u8], pub_key_buf_2: &[u8]) -> Result<Vec<u8>, String> {
    if pub_key_buf_1.len() != 33 || pub_key_buf_2.len() != 33 {
        return Err("Public keys must be 33 bytes in compressed format".to_string());
    }

    let pub_key_1 = PublicKey::from_sec1_bytes(pub_key_buf_1)
        .map_err(|_| "Invalid first public key".to_string())?;
    let pub_key_2 = PublicKey::from_sec1_bytes(pub_key_buf_2)
        .map_err(|_| "Invalid second public key".to_string())?;

    let combined_pub_key = ProjectivePoint::from(pub_key_1) + ProjectivePoint::from(pub_key_2);

    Ok(combined_pub_key.to_encoded_point(true).as_bytes().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
#[allow(non_snake_case)]
pub fn sign(
    hash_buf: &[u8],     // Hash digest buffer
    priv_key_buf: &[u8], // Private key buffer
    k_buf: &[u8],        // Ephemeral scalar buffer
) -> Result<Vec<u8>, String> {
    if priv_key_buf.len() != 32 || k_buf.len() != 32 || hash_buf.len() != 32 {
        return Err("All inputs must be exactly 32 bytes".to_string());
    }
    if priv_key_buf.iter().all(|&b| b == 0)
        || k_buf.iter().all(|&b| b == 0)
        || hash_buf.iter().all(|&b| b == 0)
    {
        return Err("All inputs cannot be all zeros".to_string());
    }

    let d_uint = U256::from_be_slice(priv_key_buf);
    let k_uint = U256::from_be_slice(k_buf);
    let z_field_bytes = FieldBytes::from_slice(hash_buf);

    let d_scalar =
        NonZeroScalar::<Secp256k1>::from_uint(d_uint).expect("Failed to create d_scalar");
    let k_scalar =
        NonZeroScalar::<Secp256k1>::from_uint(k_uint).expect("Failed to create k_scalar");

    let z_scalar =
        <Scalar as Reduce<<k256::Secp256k1 as k256::elliptic_curve::Curve>::Uint>>::reduce_bytes(
            z_field_bytes,
        );

    let k_inv = k_scalar.invert();

    let R = ProjectivePoint::mul_by_generator(&k_scalar).to_affine();

    let r =
        <Scalar as Reduce<<k256::Secp256k1 as k256::elliptic_curve::Curve>::Uint>>::reduce_bytes(
            &R.x(),
        );

    let mut s = *k_inv * (z_scalar + (r * d_scalar.as_ref()));

    // Normalize s to the lower half of the curve order
    let n_uint = Secp256k1::ORDER;
    let n = Scalar::from_uint_unchecked(n_uint);
    if s > n >> 1 {
        s = n - s;
    }

    let s_bytes = s.to_bytes();
    let r_bytes = r.to_bytes();
    let rs_bytes = [r_bytes, s_bytes].concat();
    if rs_bytes.len() != 64 {
        return Err("Failed to create signature of correct length".to_string());
    }

    Ok(rs_bytes)
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn verify(
    sig_buf: &[u8],     // Signature buffer
    hash_buf: &[u8],    // Hash digest buffer
    pub_key_buf: &[u8], // Public key buffer
) -> Result<(), String> {
    if pub_key_buf.len() != 33 || hash_buf.len() != 32 || sig_buf.len() != 64 {
        return Err("All inputs must be exactly 33, 32, and 64 bytes".to_string());
    }
    if pub_key_buf.iter().all(|&b| b == 0)
        || hash_buf.iter().all(|&b| b == 0)
        || sig_buf.iter().all(|&b| b == 0)
    {
        return Err("All inputs cannot be all zeros".to_string());
    }

    let q_public_key =
        PublicKey::from_sec1_bytes(pub_key_buf).map_err(|_| "Invalid public key".to_string())?;
    let q = ProjectivePoint::from(q_public_key);

    let z = FieldBytes::from_slice(hash_buf);

    let r_bytes = &sig_buf[0..32];
    if r_bytes.iter().all(|&b| b == 0) {
        return Err("Signature r cannot be all zeros".to_string());
    }
    let s_bytes = &sig_buf[32..64];
    if s_bytes.iter().all(|&b| b == 0) {
        return Err("Signature s cannot be all zeros".to_string());
    }
    let r_field_bytes = FieldBytes::from_slice(r_bytes);
    let s_field_bytes = FieldBytes::from_slice(s_bytes);

    let z =
        <Scalar as Reduce<<k256::Secp256k1 as k256::elliptic_curve::Curve>::Uint>>::reduce_bytes(z);
    let r =
        <Scalar as Reduce<<k256::Secp256k1 as k256::elliptic_curve::Curve>::Uint>>::reduce_bytes(
            r_field_bytes,
        );
    let s =
        <Scalar as Reduce<<k256::Secp256k1 as k256::elliptic_curve::Curve>::Uint>>::reduce_bytes(
            s_field_bytes,
        );
    let s_inv = s.invert().expect("Failed to invert s");
    let u1 = z * s_inv;
    let u2 = r * s_inv;
    let x = ProjectivePoint::mul_by_generator(&u1) + q * u2;
    let x = x.to_affine().x();

    if r.to_bytes().to_vec() == x.to_vec() {
        Ok(())
    } else {
        Err("Signature verification failed".to_string())
    }
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn shared_secret(priv_key_buf: &[u8], pub_key_buf: &[u8]) -> Result<Vec<u8>, String> {
    if priv_key_buf.len() != 32 {
        return Err("Private key must be exactly 32 bytes".to_string());
    }
    if pub_key_buf.len() != 33 {
        return Err("Public key must be 33 bytes in compressed format".to_string());
    }

    // Convert the private key bytes into a SecretKey
    let secret_key =
        SecretKey::from_slice(priv_key_buf).map_err(|_| "Invalid private key".to_string())?;

    // Extract the Scalar (the actual secret) from the SecretKey
    let nonzero_scalar = secret_key.to_nonzero_scalar();
    let scalar: Scalar = *nonzero_scalar;

    // Convert the public key bytes into a point
    let pub_key =
        PublicKey::from_sec1_bytes(pub_key_buf).map_err(|_| "Invalid public key".to_string())?;

    // use arithmetic: secret key = private key * public key
    let point = pub_key.as_affine();
    let secret_key = point.mul(scalar).to_affine();
    // Convert the resulting point to an encoded form (compressed)
    let encoded_point = secret_key.to_encoded_point(true); // `true` for compressed format

    // Convert the encoded point to a Vec<u8>
    Ok(encoded_point.as_bytes().to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;
    use earthbucks_blake3;
    use hex_literal::hex;
    use log::debug;
    use rfc6979::consts::U32;
    use rfc6979::generate_k;
    use secp256k1;
    use sha2::{Digest, Sha256};

    #[test]
    fn test_private_key_verify() {
        let valid_priv_key = [0x01; 32];
        let invalid_priv_key = [0x01; 31];

        assert!(private_key_verify(&valid_priv_key));
        assert!(!private_key_verify(&invalid_priv_key));
    }

    #[test]
    fn test_public_key_create() {
        let priv_key = [0x01; 32];
        let pub_key = public_key_create(&priv_key).unwrap();

        assert_eq!(pub_key.len(), 33); // Compressed public key length
    }

    #[test]
    fn test_private_key_add() {
        let priv_key_1 = [0x01; 32];
        let priv_key_2 = [0x02; 32];

        let result = private_key_add(&priv_key_1, &priv_key_2).unwrap();
        assert_eq!(result.len(), 32);
    }

    #[test]
    fn test_public_key_add() {
        let priv_key_1 = [0x01; 32];
        let priv_key_2 = [0x02; 32];

        let pub_key_1 = public_key_create(&priv_key_1).unwrap();
        let pub_key_2 = public_key_create(&priv_key_2).unwrap();

        let combined_pub_key = public_key_add(&pub_key_1, &pub_key_2).unwrap();
        assert_eq!(combined_pub_key.len(), 33);
    }

    #[test]
    fn test_sign_and_verify() {
        let priv_key = [0x01; 32];
        let message = [0x02; 32];

        let blake3_k: [u8; 32] = earthbucks_blake3::hash::blake3_mac(&priv_key, &message)
            .unwrap()
            .try_into()
            .unwrap();

        let signature = sign(&message, &priv_key, &blake3_k).unwrap();
        assert_eq!(signature.len(), 64);

        let pub_key = public_key_create(&priv_key).unwrap();
        assert!(verify(&signature, &message, &pub_key).is_ok());
    }

    #[test]
    fn test_verify_invalid_signature() {
        let priv_key = [0x01; 32];
        let message = [0x02; 32];
        let invalid_message = [0x03; 32];

        let blake3_k: [u8; 32] = earthbucks_blake3::hash::blake3_mac(&priv_key, &message)
            .unwrap()
            .try_into()
            .unwrap();

        let signature = sign(&message, &priv_key, &blake3_k).unwrap();
        let pub_key = public_key_create(&priv_key).unwrap();

        assert!(verify(&signature, &invalid_message, &pub_key).is_err());
    }

    #[test]
    fn test_diffie_hellman_shared_secret() {
        // Known private keys (32 bytes)
        let priv_key_1: [u8; 32] = [
            0x38, 0x49, 0x58, 0x49, 0xf8, 0x38, 0xe8, 0xd5, 0xf8, 0xc9, 0x4d, 0xf2, 0x7a, 0x3c,
            0x91, 0x8d, 0x8e, 0xe9, 0x6a, 0xbf, 0x6b, 0x74, 0x5f, 0xb5, 0x4d, 0x82, 0x1b, 0xf9,
            0x5b, 0x6e, 0x5d, 0xc3,
        ];
        let priv_key_2: [u8; 32] = [
            0x55, 0x91, 0x22, 0x55, 0x18, 0xa9, 0x19, 0xf0, 0x2a, 0x3f, 0x8c, 0x9a, 0x7a, 0x1b,
            0xc1, 0xe2, 0x9d, 0x81, 0x3c, 0xd8, 0x5a, 0x39, 0xe7, 0xaa, 0x89, 0x9d, 0xf4, 0x64,
            0x5e, 0x4a, 0x6b, 0x91,
        ];

        // Derive the corresponding public keys
        let pub_key_1 = public_key_create(&priv_key_1).unwrap();
        let pub_key_2 = public_key_create(&priv_key_2).unwrap();

        // Both parties derive the shared secret using the other's public key
        let shared_secret_1 = shared_secret(&priv_key_1, &pub_key_2).unwrap();
        let shared_secret_2 = shared_secret(&priv_key_2, &pub_key_1).unwrap();

        // Assert that both derived shared secrets are the same
        assert_eq!(shared_secret_1, shared_secret_2);
    }

    // secp256k1 curve order (modulus)
    const SECP256K1_MODULUS: [u8; 32] =
        hex!("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");

    // Private key for testing (RFC6979 format)
    const RFC6979_KEY: [u8; 32] =
        hex!("C9AFA9D845BA75166B5C215767B1D6934E50C3DB36E89B127B8A622B120F6721");

    // Test message for RFC6979
    const RFC6979_MSG: &[u8; 6] = b"sample";

    // Expected `k` for RFC6979 using secp256k1 and SHA256
    const RFC6979_EXPECTED_K: [u8; 32] =
        hex!("A6E3C57DD01ABE90086538398355DD4C3B17AA873382B0F24D6129493D8AAD60");

    #[test]
    fn test_custom_sign_verify_against_lib_secp256k1() {
        // let _ = env_logger::builder().is_test(true).try_init();
        // debug!("This is a debug message.");

        // Step 1: Hash the message
        let hashed_msg = Sha256::digest(RFC6979_MSG);
        let hashed_msg_bytes: [u8; 32] = hashed_msg.as_slice().try_into().unwrap();

        // Step 2: Generate deterministic k using RFC 6979 and SHA256
        let k = generate_k::<Sha256, U32>(
            &RFC6979_KEY.into(),
            &SECP256K1_MODULUS.into(),
            &hashed_msg,
            b"",
        );

        // Ensure the generated k matches the expected value
        assert_eq!(
            k.as_slice(),
            &RFC6979_EXPECTED_K,
            "Generated k does not match the expected k"
        );

        // Step 3: Sign the message using the generated k and the custom sign_with_k method
        let custom_signature = sign(&hashed_msg, &RFC6979_KEY, k.as_slice()).unwrap();

        // Step 4. Verify using secp256k1
        let secp256k1_public_key =
            secp256k1::PublicKey::from_slice(&public_key_create(&RFC6979_KEY).unwrap())
                .expect("Failed to create public key");
        let secp256k1_sig = secp256k1::ecdsa::Signature::from_compact(&custom_signature)
            .expect("Failed to create signature");
        let secp256k1_message = secp256k1::Message::from_digest(hashed_msg_bytes);
        let secp = secp256k1::Secp256k1::new();
        let secp256k1_verified =
            secp.verify_ecdsa(&secp256k1_message, &secp256k1_sig, &secp256k1_public_key);
        assert!(
            secp256k1_verified.is_ok(),
            "Failed to verify signature using secp256k1: {:?}",
            secp256k1_verified
        );

        let custom_verified = verify(
            &custom_signature,
            &hashed_msg,
            &public_key_create(&RFC6979_KEY).unwrap(),
        );
        assert!(
            custom_verified.is_ok(),
            "Failed to verify signature using custom method: {:?}",
            custom_verified
        );
    }

    const N_SIG_TESTS: u32 = 50;

    /// Test 5,000 signatures with different private keys, using a deterministic process
    #[test]
    fn test_n_sig_tests_signatures_different_private_keys() {
        let message = b"sample"; // Same message for all tests
        let hashed_msg = Sha256::digest(message);
        let hashed_msg_bytes: [u8; 32] = hashed_msg.as_slice().try_into().unwrap();

        // Use the string "initial seed" as the seed for deterministic key generation
        let mut seed = b"initial seed".to_vec();

        for i in 0..N_SIG_TESTS {
            // println!("i: {}", i);
            // Create a deterministic private key by hashing the seed and index
            seed.push(i as u8);
            let private_key = deterministic_32_bytes(&seed);
            seed.pop(); // Reset seed to the original value

            // Deterministically generate k using RFC 6979 and the private key
            let k = generate_k::<Sha256, U32>(
                &private_key.into(),
                &SECP256K1_MODULUS.into(),
                &hashed_msg,
                b"",
            );

            // Sign the message using both methods
            let custom_signature = sign(&hashed_msg_bytes, &private_key, k.as_slice()).unwrap();
            let secp_public_key =
                secp256k1::PublicKey::from_slice(&public_key_create(&private_key).unwrap())
                    .unwrap();
            let secp_sig = secp256k1::ecdsa::Signature::from_compact(&custom_signature).unwrap();
            let secp_msg = secp256k1::Message::from_digest(hashed_msg_bytes);
            let secp = secp256k1::Secp256k1::new();
            assert!(
                secp.verify_ecdsa(&secp_msg, &secp_sig, &secp_public_key)
                    .is_ok(),
                "Secp256k1 verification failed"
            );

            let custom_verified = verify(
                &custom_signature,
                &hashed_msg_bytes,
                &public_key_create(&private_key).unwrap(),
            );
            assert!(custom_verified.is_ok(), "Custom verification failed");
        }
    }

    /// Test 5,000 signatures with different messages, using a deterministic process
    #[test]
    fn test_n_sig_tests_signatures_different_messages() {
        let private_key = deterministic_32_bytes(b"initial seed"); // Same private key for all tests

        // Use the string "initial seed" as the seed for deterministic message generation
        let mut seed = b"initial seed".to_vec();

        for i in 0..N_SIG_TESTS {
            // println!("i: {}", i);
            // Create a deterministic message by hashing the seed and index
            seed.push(i as u8);
            let message = deterministic_32_bytes(&seed);
            seed.pop(); // Reset seed to the original value

            let hashed_msg = Sha256::digest(message);
            let hashed_msg_bytes: [u8; 32] = hashed_msg.as_slice().try_into().unwrap();
            let k = generate_k::<Sha256, U32>(
                &private_key.into(),
                &SECP256K1_MODULUS.into(),
                &hashed_msg,
                b"",
            );

            // Sign the message using both methods
            let custom_signature = sign(&hashed_msg_bytes, &private_key, k.as_slice()).unwrap();
            let secp_public_key =
                secp256k1::PublicKey::from_slice(&public_key_create(&private_key).unwrap())
                    .unwrap();
            let secp_sig = secp256k1::ecdsa::Signature::from_compact(&custom_signature).unwrap();
            let secp_msg = secp256k1::Message::from_digest(hashed_msg_bytes);
            let secp = secp256k1::Secp256k1::new();
            assert!(
                secp.verify_ecdsa(&secp_msg, &secp_sig, &secp_public_key)
                    .is_ok(),
                "Secp256k1 verification failed"
            );

            let custom_verified = verify(
                &custom_signature,
                &hashed_msg_bytes,
                &public_key_create(&private_key).unwrap(),
            );
            assert!(custom_verified.is_ok(), "Custom verification failed");
        }
    }

    /// Helper function to deterministically generate a 32-byte array based on input seed
    fn deterministic_32_bytes(seed: &[u8]) -> [u8; 32] {
        let mut hasher = Sha256::new();
        hasher.update(seed);
        let result = hasher.finalize();
        result
            .as_slice()
            .try_into()
            .expect("Hash output length mismatch")
    }

    #[test]
    fn test_sign_with_rfc6979_k() {
        let _ = env_logger::builder().is_test(true).try_init();
        debug!("This is a debug message.");

        // Step 1: Hash the message
        let hashed_msg = Sha256::digest(RFC6979_MSG);
        let hashed_msg_bytes: [u8; 32] = hashed_msg.as_slice().try_into().unwrap();

        // Step 2: Generate deterministic k using RFC 6979 and SHA256
        let k = generate_k::<Sha256, U32>(
            &RFC6979_KEY.into(),
            &SECP256K1_MODULUS.into(),
            &hashed_msg,
            b"",
        );

        // Ensure the generated k matches the expected value
        assert_eq!(
            k.as_slice(),
            &RFC6979_EXPECTED_K,
            "Generated k does not match the expected k"
        );

        // Step 3: Sign the message using the generated k and the custom sign_with_k method
        let custom_signature = sign(&hashed_msg, &RFC6979_KEY, k.as_slice()).unwrap();

        // Step 4: Use lisecp256k1
        let secp256k1_private_key =
            secp256k1::SecretKey::from_slice(&RFC6979_KEY).expect("Failed to create private key");
        let secp = secp256k1::Secp256k1::new();
        let secp256k1_message = secp256k1::Message::from_digest(hashed_msg_bytes);
        let secp256k1_signature = secp.sign_ecdsa(&secp256k1_message, &secp256k1_private_key);

        // Ensure the custom signature matches the secp256k1 signature in hex
        assert_eq!(
            hex::encode(custom_signature),
            hex::encode(secp256k1_signature.serialize_compact()),
            "Custom signature does not match secp256k1 signature"
        );
    }

    #[test]
    fn test_custom_sign_should_verify_against_custom_verify() {
        let hashed_msg = Sha256::digest(RFC6979_MSG);
        let hashed_msg_bytes: [u8; 32] = hashed_msg.as_slice().try_into().unwrap();

        // Step 2: Generate deterministic k using RFC 6979 and SHA256
        let k = generate_k::<Sha256, U32>(
            &RFC6979_KEY.into(),
            &SECP256K1_MODULUS.into(),
            &hashed_msg,
            b"",
        );

        // Ensure the generated k matches the expected value;
        assert_eq!(
            k.as_slice(),
            &RFC6979_EXPECTED_K,
            "Generated k does not match the expected k"
        );

        // Step 3: Sign the message using the generated k and the custom sign_with_k method
        let custom_signature = sign(&hashed_msg_bytes, &RFC6979_KEY, k.as_slice()).unwrap();

        // Step 4: Verify the signature using the custom verify method
        let verified = verify(
            &custom_signature,
            &hashed_msg,
            &public_key_create(&RFC6979_KEY).unwrap(),
        );
        assert!(
            verified.is_ok(),
            "Failed to verify signature: {:?}",
            verified
        );
    }
}
