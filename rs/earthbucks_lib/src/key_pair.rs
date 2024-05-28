use crate::ebx_error::EbxError;
use crate::priv_key::PrivKey;
use crate::pub_key::PubKey;

#[derive(Clone, Debug)]
pub struct KeyPair {
    pub priv_key: PrivKey,
    pub pub_key: PubKey,
}

impl KeyPair {
    pub fn new(priv_key: [u8; 32]) -> Result<Self, EbxError> {
        let priv_key = PrivKey::new(priv_key);
        let pub_key = PubKey::from_priv_key(&priv_key);
        if pub_key.is_err() {
            return Err(pub_key.err().unwrap());
        }
        Ok(KeyPair {
            priv_key,
            pub_key: pub_key.unwrap(),
        })
    }

    pub fn from_priv_key(priv_key: &PrivKey) -> Result<Self, EbxError> {
        let pub_key_res = PubKey::from_priv_key(priv_key);
        if pub_key_res.is_err() {
            return Err(EbxError::InvalidKeyError { source: None });
        }
        Ok(KeyPair {
            priv_key: priv_key.clone(),
            pub_key: pub_key_res.unwrap(),
        })
    }

    pub fn from_random() -> Self {
        let priv_key = PrivKey::from_random();
        KeyPair::from_priv_key(&priv_key).unwrap()
    }

    pub fn is_valid(&self) -> bool {
        let pub_key = PubKey::from_priv_key(&self.priv_key);
        if pub_key.is_err() {
            return false;
        }
        self.pub_key.is_valid() && pub_key.unwrap().buf == self.pub_key.buf
    }
}
