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
