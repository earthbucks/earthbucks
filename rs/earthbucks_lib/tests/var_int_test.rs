use earthbucks_lib::var_int::*;

#[test]
fn test_from_u64() {
    let varint = VarInt::from_u64(1234567890);

    assert_eq!(varint.to_u64().unwrap(), 1234567890);
}

#[test]
fn test_from_u32() {
    let varint = VarInt::from_u32(123456789);

    assert_eq!(varint.to_u64().unwrap(), 123456789);
}

#[test]
fn test_to_iso_buf() {
    let varint = VarInt::from_u64(1234567890);
    let vec = varint.to_iso_buf();

    assert!(!vec.is_empty());
}

#[test]
fn test_to_u64() {
    let varint = VarInt::from_u64(1234567890);
    let num = varint.to_u64().unwrap();

    // Add assertions here based on how VarInt is expected to represent the u64
    // For example, if VarInt has a method 'to_u64' that should return the original u64:
    assert_eq!(num, 1234567890);
}

#[test]
fn test_is_minimal() {
    let varint = VarInt::from_u64(1234567890);

    // Add assertions here based on how VarInt is expected to behave
    // For example, if VarInt is expected to be minimal after being created from a u64:
    assert!(varint.is_minimal());
}
