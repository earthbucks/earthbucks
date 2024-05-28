use earthbucks_lib::iso_hex::*;

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
