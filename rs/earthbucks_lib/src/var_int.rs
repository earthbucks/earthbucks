use crate::buf_reader::BufReader;
use crate::buf_writer::BufWriter;
use crate::error::EbxError;

#[derive(Default)]
pub struct VarInt {
    buf: Vec<u8>,
}

impl VarInt {
    pub fn new() -> Self {
        Self { buf: vec![] }
    }

    pub fn from_u64(bn: u64) -> Self {
        let mut varint = Self::new();
        varint.buf = BufWriter::new().write_var_int(bn).to_buf();
        varint
    }

    pub fn from_u32(num: u32) -> Self {
        let mut varint = Self::new();
        varint.buf = BufWriter::new().write_var_int(num as u64).to_buf();
        varint
    }

    pub fn to_buf(&self) -> Vec<u8> {
        self.buf.clone()
    }

    pub fn to_u64(&self) -> Result<u64, EbxError> {
        BufReader::new(self.buf.clone()).read_var_int()
    }

    pub fn from_buf_reader(br: &mut BufReader) -> Result<Self, EbxError> {
        let buf = br.read_var_int_buf()?;
        Ok(VarInt { buf })
    }

    pub fn is_minimal(&self) -> bool {
        let res = self.to_u64();
        res.is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
    fn test_to_buf() {
        let varint = VarInt::from_u64(1234567890);
        let vec = varint.to_buf();

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
}
