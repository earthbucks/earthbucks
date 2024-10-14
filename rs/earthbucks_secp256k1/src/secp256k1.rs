use k256::{
    ecdsa::{signature::Signer, signature::Verifier, Signature, SigningKey, VerifyingKey},
    elliptic_curve::sec1::ToEncodedPoint,
    ProjectivePoint, PublicKey, SecretKey,
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
pub fn ecdsa_sign(digest: &[u8], priv_key_buf: &[u8]) -> Result<Vec<u8>, String> {
    if digest.len() != 32 {
        return Err("Digest must be exactly 32 bytes".to_string());
    }
    if priv_key_buf.len() != 32 {
        return Err("Private key must be exactly 32 bytes".to_string());
    }

    let signing_key =
        SigningKey::from_slice(priv_key_buf).map_err(|_| "Invalid private key".to_string())?;

    let (signature, _recid) = signing_key.sign(digest);

    Ok(signature.to_bytes().to_vec())
}

#[cfg_attr(feature = "wasm", wasm_bindgen)]
pub fn ecdsa_verify(sig_buf: &[u8], digest: &[u8], pub_key_buf: &[u8]) -> Result<bool, String> {
    if digest.len() != 32 {
        return Err("Digest must be exactly 32 bytes".to_string());
    }
    if pub_key_buf.len() != 33 {
        return Err("Public key must be 33 bytes in compressed format".to_string());
    }

    let verifying_key =
        VerifyingKey::from_sec1_bytes(pub_key_buf).map_err(|_| "Invalid public key".to_string())?;
    let signature = Signature::try_from(sig_buf).map_err(|_| "Invalid signature".to_string())?;

    Ok(verifying_key.verify(digest, &signature).is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_ecdsa_sign_and_verify() {
        let priv_key = [0x01; 32];
        let message = [0x02; 32];

        let signature = ecdsa_sign(&message, &priv_key).unwrap();
        assert_eq!(signature.len(), 64);

        let pub_key = public_key_create(&priv_key).unwrap();
        assert!(ecdsa_verify(&signature, &message, &pub_key).unwrap());
    }

    #[test]
    fn test_ecdsa_verify_invalid_signature() {
        let priv_key = [0x01; 32];
        let message = [0x02; 32];
        let invalid_message = [0x03; 32];

        let signature = ecdsa_sign(&message, &priv_key).unwrap();
        let pub_key = public_key_create(&priv_key).unwrap();

        assert!(!ecdsa_verify(&signature, &invalid_message, &pub_key).unwrap());
    }
}
