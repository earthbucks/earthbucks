use crate::strict_hex;
use bs58;
use rand::Rng;
use secp256k1::{PublicKey, Secp256k1, SecretKey};

#[derive(Clone, Debug)]
pub struct PrivKey {
    pub buf: [u8; 32],
}

impl PrivKey {
    pub fn new(priv_key: [u8; 32]) -> Self {
        PrivKey { buf: priv_key }
    }

    pub fn from_random() -> Self {
        let mut rng = rand::thread_rng();
        let mut key_data = [0u8; 32];
        loop {
            rng.fill(&mut key_data);
            if let Ok(secret_key) = SecretKey::from_slice(&key_data) {
                return PrivKey::new(*secret_key.as_ref());
            }
        }
    }

    pub fn to_pub_key_buffer(&self) -> Result<[u8; 33], String> {
        let secret_key = SecretKey::from_slice(&self.buf);
        if secret_key.is_err() {
            return Err("Invalid secret key".to_string());
        }
        let secp = Secp256k1::new();
        let public_key_obj = PublicKey::from_secret_key(&secp, &secret_key.unwrap());
        Ok(public_key_obj.serialize())
    }

    pub fn to_pub_key_hex(&self) -> Result<String, String> {
        let pub_key_buf = self.to_pub_key_buffer()?;
        Ok(strict_hex::encode(&pub_key_buf))
    }

    pub fn from_buffer(buffer: &[u8; 32]) -> Self {
        let mut priv_key = [0u8; 32];
        priv_key.copy_from_slice(buffer);
        PrivKey::new(priv_key)
    }

    pub fn from_u8_vec(vec: Vec<u8>) -> Result<Self, String> {
        if vec.len() != 32 {
            return Err("Invalid buffer length".to_string());
        }
        let mut priv_key = [0u8; 32];
        priv_key.copy_from_slice(&vec);
        Ok(PrivKey::new(priv_key))
    }

    pub fn to_hex(&self) -> String {
        hex::encode(self.buf)
    }

    pub fn from_hex(hex: &str) -> Result<Self, String> {
        let priv_key_vec: Vec<u8> = strict_hex::decode(hex)?;
        PrivKey::from_u8_vec(priv_key_vec)
    }

    pub fn to_string_fmt(&self) -> String {
        "ebxprv".to_string() + &bs58::encode(&self.buf).into_string()
    }

    pub fn from_string_fmt(s: &str) -> Result<Self, String> {
        if !s.starts_with("ebxprv") {
            return Err("Invalid private key format".to_string());
        }
        let buf = bs58::decode(&s[6..])
            .into_vec()
            .map_err(|_| "Invalid base58 encoding".to_string())?;
        PrivKey::from_u8_vec(buf)
    }

    pub fn is_valid(s: &str) -> bool {
        let res = Self::from_string_fmt(s);
        res.is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_random() {
        let priv_key = PrivKey::from_random();
        println!("priv_key: {}", priv_key.to_hex());
    }

    #[test]
    fn test_to_pub_key_buf() {
        let priv_key = PrivKey::from_random();
        let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();
        println!("pub_key_buf: {}", hex::encode(pub_key_buf));
    }

    #[test]
    fn test_to_hex() {
        let priv_key = PrivKey::from_random();
        let hex = priv_key.to_hex();
        println!("hex: {}", hex);
    }

    #[test]
    fn test_from_hex() {
        let priv_key = PrivKey::from_random();
        let hex = priv_key.to_hex();
        let priv_key2 = PrivKey::from_hex(&hex).unwrap();
        assert_eq!(priv_key.buf, priv_key2.buf);
    }

    #[test]
    fn test_to_string() {
        let priv_key = PrivKey::from_random();
        let s = priv_key.to_string_fmt();
        println!("s: {}", s);
    }

    #[test]
    fn test_from_string() {
        let priv_key = PrivKey::from_random();
        let s = priv_key.to_string_fmt();
        let priv_key2 = PrivKey::from_string_fmt(&s).unwrap();
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
            PrivKey::from_hex("2ef930fed143c0b92b485c29aaaba97d09cab882baafdb9ea1e55dec252cd09f")
                .unwrap();
        let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();
        let pub_key_hex = strict_hex::encode(&pub_key_buf);
        assert_eq!(
            pub_key_hex,
            "03f9bd9639017196c2558c96272d0ea9511cd61157185c98ae3109a28af058db7b"
        );
    }

    #[test]
    fn test_to_from_string_format() {
        assert!(PrivKey::is_valid("ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes"));
        assert!(!PrivKey::is_valid("ebxprGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes"));
        assert!(!PrivKey::is_valid("ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaM"));

        let str = "ebxprvGQLKEaBEbcUSiqW1d5xadmN6iHjLP8DDMaMogoHUtzes";
        let priv_key = PrivKey::from_string_fmt(str).unwrap();
        assert_eq!(priv_key.to_string_fmt(), str);
    }
}
