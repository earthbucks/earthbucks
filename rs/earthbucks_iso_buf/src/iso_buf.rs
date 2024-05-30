use hex;
use lazy_static::lazy_static;
use regex::Regex;

use crate::iso_buf_error::IsoBufError;

lazy_static! {
    static ref RE: Regex = Regex::new(r"^[0-9a-f]*$").unwrap();
}

pub fn is_valid_hex(hex: &str) -> bool {
    RE.is_match(hex) && hex.len() % 2 == 0
}

pub fn encode_hex(data: &[u8]) -> String {
    hex::encode(data)
}

pub fn decode_hex(hex: &str) -> Result<Vec<u8>, IsoBufError> {
    if !is_valid_hex(hex) {
        return Err(IsoBufError::InvalidHexError { source: None });
    }
    let res = hex::decode(hex);
    if res.is_err() {
        return Err(IsoBufError::InvalidHexError { source: None });
    }
    Ok(res.unwrap())
}

pub fn from_hex<T: StrictHex>(hex: &str) -> Result<T, IsoBufError> {
    T::from_hex(hex)
}

pub trait StrictHex {
    fn to_hex(&self) -> String;
    fn from_hex(hex: &str) -> Result<Self, IsoBufError>
    where
        Self: Sized;
}

impl StrictHex for Vec<u8> {
    fn to_hex(&self) -> String {
        encode_hex(self)
    }

    fn from_hex(hex: &str) -> Result<Self, IsoBufError> {
        decode_hex(hex)
    }
}

impl<const N: usize> StrictHex for [u8; N] {
    fn to_hex(&self) -> String {
        self.iter().fold(String::new(), |mut acc, &byte| {
            acc.push_str(&format!("{:02x}", byte));
            acc
        })
    }

    fn from_hex(hex: &str) -> Result<Self, IsoBufError> {
        if hex.len() != N * 2 {
            return Err(IsoBufError::InvalidHexError { source: None });
        }
        decode_hex(hex).and_then(|vec| {
            vec.try_into()
                .map_err(|_| IsoBufError::InvalidHexError { source: None })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid() {
        assert!(is_valid_hex("00"));
        assert!(is_valid_hex("1234567890abcdef"));
        assert!(!is_valid_hex("1234567890abcde"));
        assert!(!is_valid_hex("0"));
        assert!(!is_valid_hex("0g"));
        assert!(!is_valid_hex("1234567890abcdeF"));
    }

    #[test]
    fn test_encode_decode() {
        let buffer = hex::decode("1234567890abcdef").unwrap();
        let hex = encode_hex(&buffer);
        let decoded_buffer = decode_hex(&hex).unwrap();
        assert_eq!(decoded_buffer, buffer);
    }

    #[test]
    fn test_to_from_hex() {
        {
            let hex = "00ff";
            let buf: Vec<u8> = from_hex(hex).unwrap();
            assert_eq!(buf.to_hex(), hex);
        }
        {
            let hex = "00ff";
            let buf: [u8; 2] = from_hex(hex).unwrap();
            assert_eq!(buf.to_hex(), hex);
        }
        {
            let hex = "00ff";
            let buf = Vec::<u8>::from_hex(hex).unwrap();
            assert_eq!(buf.to_hex(), hex);
        }
        {
            let hex = "00ff";
            let buf = <[u8; 2]>::from_hex(hex).unwrap();
            assert_eq!(buf.to_hex(), hex);
        }
    }
}
