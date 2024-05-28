use earthbucks_lib::key_pair::KeyPair;
use earthbucks_lib::pkh::Pkh;
use earthbucks_lib::pkh_key_map::*;

#[test]
fn test_add() {
    let mut pkh_key_map = PkhKeyMap::new();
    let key = KeyPair::from_random();
    let key_clone = key.clone();
    let pkh = Pkh::from_pub_key_buffer(key_clone.pub_key.buf.to_vec());
    let pkh_iso_buf = pkh.buf;
    pkh_key_map.add(key.clone(), &pkh_iso_buf);
    let retrieved_key = pkh_key_map.get(&pkh_iso_buf).unwrap();
    assert_eq!(
        hex::encode(retrieved_key.priv_key.buf),
        hex::encode(key.priv_key.buf)
    );
}

#[test]
fn test_remove() {
    let mut pkh_key_map = PkhKeyMap::new();
    let key = KeyPair::from_random();
    let key_clone = key.clone();
    let pkh = Pkh::from_pub_key_buffer(key_clone.pub_key.buf.to_vec());
    let pkh_iso_buf = pkh.buf;
    pkh_key_map.add(key.clone(), &pkh_iso_buf);
    pkh_key_map.remove(&pkh_iso_buf);
    assert!(pkh_key_map.get(&pkh_iso_buf).is_none());
}

#[test]
fn test_get() {
    let mut pkh_key_map = PkhKeyMap::new();
    let key = KeyPair::from_random();
    let key_clone = key.clone();
    let pkh = Pkh::from_pub_key_buffer(key_clone.pub_key.buf.to_vec());
    let pkh_iso_buf = pkh.buf;
    pkh_key_map.add(key.clone(), &pkh_iso_buf);
    let retrieved_key = pkh_key_map.get(&pkh_iso_buf).unwrap();
    assert_eq!(
        hex::encode(retrieved_key.priv_key.buf),
        hex::encode(key.priv_key.buf)
    );
}

#[test]
fn test_values() {
    let mut pkh_key_map = PkhKeyMap::new();
    let key1 = KeyPair::from_random();
    let key1_clone = key1.clone();
    let pkh1 = Pkh::from_pub_key_buffer(key1_clone.pub_key.buf.to_vec());
    let pkh_iso_buf1 = pkh1.buf;
    let key2 = KeyPair::from_random();
    let key2_clone = key2.clone();
    let pkh2 = Pkh::from_pub_key_buffer(key2_clone.pub_key.buf.to_vec());
    let pkh_iso_buf2 = pkh2.buf;
    pkh_key_map.add(key1.clone(), &pkh_iso_buf1);
    pkh_key_map.add(key2.clone(), &pkh_iso_buf2);
    let values: Vec<&KeyPair> = pkh_key_map.values().collect();
    assert_eq!(values.len(), 2);

    let key1_encoded = hex::encode(key1.priv_key.buf);
    let key2_encoded = hex::encode(key2.priv_key.buf);
    let values_encoded: Vec<String> = values
        .iter()
        .map(|value| hex::encode(value.priv_key.buf))
        .collect();

    assert!(values_encoded.contains(&key1_encoded));
    assert!(values_encoded.contains(&key2_encoded));
}
