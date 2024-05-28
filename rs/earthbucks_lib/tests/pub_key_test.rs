
use earthbucks_lib::priv_key::*;
use earthbucks_lib::pub_key::*;

#[test]
fn test_from_priv_key() {
    let priv_key = PrivKey::from_random();
    let pub_key = PubKey::from_priv_key(&priv_key).unwrap();
    println!("priv_key: {}", priv_key.to_iso_str());
    println!("pub_key: {}", pub_key.to_iso_hex());
}

#[test]
fn test_is_valid() {
    let priv_key = PrivKey::from_random();
    let pub_key = PubKey::from_priv_key(&priv_key);
    assert!(pub_key.unwrap().is_valid());
}

#[test]
fn test_is_not_valid() {
    let invalid = "065b3ea48a27d75cef083a1e216d91a653577566aad51b22701d002e4ea9fc2219";
    let pub_key = PubKey::from_iso_hex(invalid).unwrap();
    assert!(!pub_key.is_valid());
}

#[test]
fn test_to_from_iso_str_format() {
    assert!(PubKey::is_valid_string_fmt(
        "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo"
    ));
    assert!(!PubKey::is_valid_string_fmt(
        "ebxpu5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYVo"
    ));
    assert!(!PubKey::is_valid_string_fmt(
        "ebxpub5c2d464b282vZKAQ9QHCDmBhwpBhK4bK2kbjFbFzSxGPueCNsYYV"
    ));
}
