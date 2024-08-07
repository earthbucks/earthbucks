use crate::error::EbxError;
use bs58;
use hex;
use lazy_static::lazy_static;
use rand::Rng;
use regex::Regex;

lazy_static! {
    static ref RE: Regex = Regex::new(r"^[0-9a-f]*$").unwrap();
}

pub fn is_valid(hex: &str) -> bool {
    RE.is_match(hex) && hex.len() % 2 == 0
}

pub fn encode(data: &[u8]) -> String {
    hex::encode(data)
}

pub fn decode(hex: &str) -> Result<Vec<u8>, EbxError> {
    if !is_valid(hex) {
        return Err(EbxError::InvalidHexError { source: None });
    }
    let res = hex::decode(hex);
    if res.is_err() {
        return Err(EbxError::InvalidHexError { source: None });
    }
    Ok(res.unwrap())
}

pub trait EbxBuf {
    fn to_strict_hex(&self) -> String;
    fn from_strict_hex(hex: &str) -> Result<Self, EbxError>
    where
        Self: Sized;
    fn to_base58(&self) -> String;
    fn from_base58(base58: &str) -> Result<Self, EbxError>
    where
        Self: Sized;
    fn from_random() -> Self;
}

impl EbxBuf for Vec<u8> {
    fn to_strict_hex(&self) -> String {
        hex::encode(self)
    }

    fn from_strict_hex(hex: &str) -> Result<Self, EbxError> {
        hex::decode(hex).map_err(|_| EbxError::InvalidHexError { source: None })
    }

    fn to_base58(&self) -> String {
        bs58::encode(self).into_string()
    }

    fn from_base58(base58: &str) -> Result<Self, EbxError> {
        bs58::decode(base58)
            .into_vec()
            .map_err(|_| EbxError::InvalidEncodingError { source: None })
    }

    fn from_random() -> Self {
        let mut buffer = vec![0u8; 32];
        let mut rng = rand::thread_rng();
        rng.fill(&mut buffer[..]);
        buffer
    }
}

impl<const N: usize> EbxBuf for [u8; N] {
    fn to_strict_hex(&self) -> String {
        hex::encode(self)
    }

    fn from_strict_hex(hex: &str) -> Result<Self, EbxError> {
        let vec = hex::decode(hex).map_err(|_| EbxError::InvalidHexError { source: None })?;
        let array: [u8; N] = vec[..]
            .try_into()
            .map_err(|_| EbxError::InvalidHexError { source: None })?;
        Ok(array)
    }

    fn to_base58(&self) -> String {
        bs58::encode(self).into_string()
    }

    fn from_base58(base58: &str) -> Result<Self, EbxError> {
        let vec = bs58::decode(base58)
            .into_vec()
            .map_err(|_| EbxError::InvalidEncodingError { source: None })?;
        let array: [u8; N] = vec[..]
            .try_into()
            .map_err(|_| EbxError::InvalidEncodingError { source: None })?;
        Ok(array)
    }

    fn from_random() -> Self {
        let mut buffer = [0u8; N];
        let mut rng = rand::thread_rng();
        rng.fill(&mut buffer[..]);
        buffer
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid() {
        assert!(is_valid("00"));
        assert!(is_valid("1234567890abcdef"));
        assert!(!is_valid("1234567890abcde"));
        assert!(!is_valid("0"));
        assert!(!is_valid("0g"));
        assert!(!is_valid("1234567890abcdeF"));
    }

    #[test]
    fn test_encode_decode() {
        let buffer = hex::decode("1234567890abcdef").unwrap();
        let hex = encode(&buffer);
        let decoded_buffer = decode(&hex).unwrap();
        assert_eq!(decoded_buffer, buffer);
    }
}
