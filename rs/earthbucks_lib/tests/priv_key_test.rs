use earthbucks_lib::iso_hex;
use earthbucks_lib::priv_key::*;

#[test]
fn test_from_random() {
    let priv_key = PrivKey::from_random();
    println!("priv_key: {}", priv_key.to_iso_str());
}

#[test]
fn test_to_pub_key_buf() {
    let priv_key = PrivKey::from_random();
    let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();
    println!("pub_key_buf: {}", hex::encode(pub_key_buf));
}

#[test]
fn test_to_iso_hex() {
    let priv_key = PrivKey::from_random();
    let hex = priv_key.to_iso_str();
    println!("hex: {}", hex);
}

#[test]
fn test_from_iso_hex() {
    let priv_key = PrivKey::from_random();
    let hex = priv_key.to_iso_hex();
    let priv_key2 = PrivKey::from_iso_hex(&hex).unwrap();
    assert_eq!(priv_key.buf, priv_key2.buf);
}

#[test]
fn test_to_string() {
    let priv_key = PrivKey::from_random();
    let s = priv_key.to_iso_str();
    println!("s: {}", s);
}

#[test]
fn test_from_iso_str() {
    let priv_key = PrivKey::from_random();
    let s = priv_key.to_iso_str();
    let priv_key2 = PrivKey::from_iso_str(&s).unwrap();
    assert_eq!(priv_key.buf, priv_key2.buf);
}

#[test]
fn test_from_slice() {
    let priv_key = PrivKey::from_random();
    let priv_key2 = PrivKey::new(priv_key.buf);
    assert_eq!(priv_key.buf, priv_key2.buf);
}

#[test]
fn test_from_slice_invalid() {
    let priv_key = PrivKey::from_random();
    let mut priv_key2 = priv_key.buf;
    priv_key2[0] = priv_key2[0].wrapping_add(1);
    assert!(PrivKey::new(priv_key2).buf != priv_key.buf);
}

#[test]
fn test_this_priv_key_vec() {
    let priv_key =
        PrivKey::from_iso_hex("2ef930fed143c0b92b485c29aaaba97d09cab882baafdb9ea1e55dec252cd09f")
            .unwrap();
    let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();
    let pub_key_hex = iso_hex::encode(&pub_key_buf);
    assert_eq!(
        pub_key_hex,
        "03f9bd9639017196c2558c96272d0ea9511cd61157185c98ae3109a28af058db7b"
    );
}

#[test]
fn test_to_from_iso_str_format() {
    assert!(PrivKey::is_valid_string_fmt(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ"
    ));
    assert!(!PrivKey::is_valid_string_fmt(
        "ebxpr786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ"
    ));
    assert!(!PrivKey::is_valid_string_fmt(
        "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjx"
    ));

    let str = "ebxprv786752b8GxmUZuZzYKihcmUv88T1K88Q7KNm1WjHCAWx2rNGRjxJ";
    let priv_key = PrivKey::from_iso_str(str).unwrap();
    assert_eq!(priv_key.to_iso_str(), str);
}
