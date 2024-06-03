pub struct TxSignature {
    pub hash_type: u8,
    pub sig_buf: [u8; 64],
}

impl TxSignature {
    pub const SIGHASH_ALL: u8 = 0x00000001;
    pub const SIGHASH_NONE: u8 = 0x00000002;
    pub const SIGHASH_SINGLE: u8 = 0x00000003;
    pub const SIGHASH_ANYONECANPAY: u8 = 0x00000080;
    pub const SIZE: usize = 65; // hashtype (1) plus r (32) plus s (32)

    pub fn new(hash_type: u8, sig_buf: [u8; 64]) -> Self {
        Self { hash_type, sig_buf }
    }

    pub fn to_buf(&self) -> [u8; TxSignature::SIZE] {
        let mut result = Vec::new();
        result.push(self.hash_type);
        result.extend(&self.sig_buf);
        result.try_into().unwrap()
    }

    pub fn from_buf(data: Vec<u8>) -> Result<Self, String> {
        if data.len() != TxSignature::SIZE {
            return Err("Invalid buffer length".to_string());
        }
        let hash_type = data[0];
        let sig_buf: [u8; 64] = data[1..65].try_into().unwrap();
        Ok(Self { hash_type, sig_buf })
    }
}
