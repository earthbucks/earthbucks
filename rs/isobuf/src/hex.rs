use hex;
use lazy_static::lazy_static;
use regex::Regex;

use crate::isobuf_error::IsobufError;

lazy_static! {
    static ref RE: Regex = Regex::new(r"^[0-9a-f]*$").unwrap();
}

pub fn is_valid(hex: &str) -> bool {
    RE.is_match(hex) && hex.len() % 2 == 0
}

pub fn encode(data: &[u8]) -> String {
    hex::encode(data)
}

pub fn decode(hex: &str) -> Result<Vec<u8>, IsobufError> {
    if !is_valid(hex) {
        return Err(IsobufError::InvalidHexError { source: None });
    }
    let res = hex::decode(hex);
    if res.is_err() {
        return Err(IsobufError::InvalidHexError { source: None });
    }
    Ok(res.unwrap())
}

pub fn from_hex<T: Hex>(hex: &str) -> Result<T, IsobufError> {
    T::from_hex(hex)
}

pub trait Hex {
    fn to_hex(&self) -> String;
    fn from_hex(hex: &str) -> Result<Self, IsobufError>
    where
        Self: Sized;
}

impl Hex for Vec<u8> {
    fn to_hex(&self) -> String {
        encode(self)
    }

    fn from_hex(hex: &str) -> Result<Self, IsobufError> {
        decode(hex)
    }
}

impl<const N: usize> Hex for [u8; N] {
    fn to_hex(&self) -> String {
        self.iter().fold(String::new(), |mut acc, &byte| {
            acc.push_str(&format!("{:02x}", byte));
            acc
        })
    }

    fn from_hex(hex: &str) -> Result<Self, IsobufError> {
        if hex.len() != N * 2 {
            return Err(IsobufError::InvalidHexError { source: None });
        }
        decode(hex).and_then(|vec| {
            vec.try_into()
                .map_err(|_| IsobufError::InvalidHexError { source: None })
        })
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
