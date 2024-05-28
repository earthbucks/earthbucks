use crate::{ebx_error::EbxError, iso_hex};
use bs58;
use rand::Rng;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

#[derive(Clone, Debug)]
pub struct PrivKey {
    pub buf: [u8; 32],
}

impl PrivKey {
    pub fn new(priv_key: [u8; 32]) -> Self {
        PrivKey { buf: priv_key }
    }

    pub fn from_random() -> Self {
        let mut rng = rand::thread_rng();
        let mut key_data = [0u8; 32];
        loop {
            rng.fill(&mut key_data);
            if let Ok(secret_key) = SecretKey::from_slice(&key_data) {
                return PrivKey::new(*secret_key.as_ref());
            }
        }
    }

    pub fn to_pub_key_buffer(&self) -> Result<[u8; 33], EbxError> {
        let secret_key = SecretKey::from_slice(&self.buf);
        if secret_key.is_err() {
            return Err(EbxError::InvalidKeyError { source: None });
        }
        let secp = Secp256k1::new();
        let public_key_obj = PublicKey::from_secret_key(&secp, &secret_key.unwrap());
        Ok(public_key_obj.serialize())
    }

    pub fn to_pub_key_hex(&self) -> Result<String, EbxError> {
        let pub_key_buf = self.to_pub_key_buffer()?;
        Ok(iso_hex::encode(&pub_key_buf))
    }

    pub fn from_buffer(buffer: &[u8; 32]) -> Self {
        let mut priv_key = [0u8; 32];
        priv_key.copy_from_slice(buffer);
        PrivKey::new(priv_key)
    }

    pub fn from_iso_buf(vec: Vec<u8>) -> Result<Self, EbxError> {
        if vec.len() > 32 {
            return Err(EbxError::TooMuchDataError { source: None });
        }
        if vec.len() < 32 {
            return Err(EbxError::NotEnoughDataError { source: None });
        }
        let mut priv_key = [0u8; 32];
        priv_key.copy_from_slice(&vec);
        Ok(PrivKey::new(priv_key))
    }

    pub fn to_iso_hex(&self) -> String {
        iso_hex::encode(&self.buf)
    }

    pub fn from_iso_hex(hex: &str) -> Result<Self, EbxError> {
        let priv_key_vec: Vec<u8> = iso_hex::decode(hex)?;
        PrivKey::from_iso_buf(priv_key_vec)
    }

    pub fn to_iso_str(&self) -> String {
        let check_buf = blake3::hash(&self.buf);
        let check_sum = &check_buf.as_bytes()[0..4];
        let check_hex = iso_hex::encode(check_sum);
        "ebxprv".to_string() + &check_hex + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_iso_str(s: &str) -> Result<Self, EbxError> {
        if !s.starts_with("ebxprv") {
            return Err(EbxError::InvalidEncodingError { source: None });
        }
        let check_sum = iso_hex::decode(&s[6..14])?;
        let buf = bs58::decode(&s[14..])
            .into_vec()
            .map_err(|_| EbxError::InvalidEncodingError { source: None })?;
        let check_buf = blake3::hash(&buf);
        let expected_check_sum = &check_buf.as_bytes()[0..4];
        if check_sum != expected_check_sum {
            return Err(EbxError::InvalidChecksumError { source: None });
        }
        PrivKey::from_iso_buf(buf)
    }

    pub fn is_valid_string_fmt(s: &str) -> bool {
        let res = Self::from_iso_str(s);
        res.is_ok()
    }
}
