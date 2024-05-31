use hex;
use lazy_static::lazy_static;
use regex::Regex;

use crate::ebx_error::EbxError;

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

pub trait StrictHex {
    fn to_hex(&self) -> String;
    fn from_hex(hex: &str) -> Result<Self, hex::FromHexError>
    where
        Self: Sized;
}

impl StrictHex for Vec<u8> {
    fn to_hex(&self) -> String {
        hex::encode(self)
    }

    fn from_hex(hex: &str) -> Result<Self, hex::FromHexError> {
        hex::decode(hex)
    }
}

impl<const N: usize> StrictHex for [u8; N] {
    fn to_hex(&self) -> String {
        hex::encode(self)
    }

    fn from_hex(hex: &str) -> Result<Self, hex::FromHexError> {
        let vec = hex::decode(hex)?;
        let array: [u8; N] = vec[..]
            .try_into()
            .map_err(|_| hex::FromHexError::InvalidStringLength)?;
        Ok(array)
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
