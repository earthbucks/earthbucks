use base64::{engine::general_purpose as lib_base64, Engine};
use hex::{decode as lib_hex_decode, encode as lib_hex_encode};
use wasm_bindgen::prelude::*;

/// Remove whitespace (spaces, tabs, newlines) from the input string
fn strip_whitespace(input: &str) -> String {
    input.chars().filter(|c| !c.is_whitespace()).collect()
}

/// Encode a byte slice into a base64 string using the default engine
#[wasm_bindgen]
pub fn encode_base64(data: &[u8]) -> String {
    lib_base64::STANDARD.encode(data)
}

/// Decode a base64 string into a byte vector
/// Returns an error string if decoding fails
#[wasm_bindgen]
pub fn decode_base64_strip_whitespace(encoded: &str) -> Result<Vec<u8>, String> {
   let stripped_encoded = strip_whitespace(encoded);
    lib_base64::STANDARD
        .decode(&stripped_encoded)
        .map_err(|_| "invalid base64".to_string())
}

#[wasm_bindgen]
pub fn decode_base64(encoded: &str) -> Result<Vec<u8>, String> {
    lib_base64::STANDARD
        .decode(encoded)
        .map_err(|_| "invalid base64".to_string())
}

/// Encode a byte slice into a hex string
#[wasm_bindgen]
pub fn encode_hex(data: &[u8]) -> String {
    lib_hex_encode(data)
}

/// Decode a hex string into a byte vector
/// Returns an error string if decoding fails
#[wasm_bindgen]
pub fn decode_hex(encoded: &str) -> Result<Vec<u8>, String> {
    lib_hex_decode(encoded).map_err(|_| "invalid hex".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_base64() {
        let input = b"Hello, world!";
        let expected_output = "SGVsbG8sIHdvcmxkIQ==";
        let result = encode_base64(input);
        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_decode_base64_valid() {
        let input = "SGVsbG8sIHdvcmxkIQ==";
        let expected_output = b"Hello, world!";
        let result = decode_base64(input).unwrap();
        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_decode_base64_invalid() {
        let input = "invalid_base64";
        let result = decode_base64(input);
        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), "invalid base64");
    }

    #[test]
    fn test_encode_hex() {
        let input = b"Hello, world!";
        let expected_output = "48656c6c6f2c20776f726c6421";
        let result = encode_hex(input);
        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_decode_hex_valid() {
        let input = "48656c6c6f2c20776f726c6421";
        let expected_output = b"Hello, world!";
        let result = decode_hex(input).unwrap();
        assert_eq!(result, expected_output);
    }

    #[test]
    fn test_decode_hex_invalid() {
        let input = "zzzz";
        let result = decode_hex(input);
        assert!(result.is_err());
        assert_eq!(result.err().unwrap(), "invalid hex");
    }
}
