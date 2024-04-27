use hex;
use lazy_static::lazy_static;
use regex::Regex;
use std::error::Error;

lazy_static! {
    static ref RE: Regex = Regex::new(r"^[0-9a-f]*$").unwrap();
}

pub fn is_valid(hex: &str) -> bool {
    RE.is_match(hex) && hex.len() % 2 == 0
}

pub fn encode(data: &[u8]) -> String {
    hex::encode(data)
}

pub fn decode(hex: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    if !is_valid(hex) {
        return Err("Invalid hex string".into());
    }
    let data = hex::decode(hex)?;
    Ok(data)
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
