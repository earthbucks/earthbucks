use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;

pub struct VarInt {
    buf: Vec<u8>,
}

impl VarInt {
    pub fn new() -> Self {
        Self { buf: vec![] }
    }

    pub fn from_u64(&mut self, bn: u64) -> &mut Self {
        self.buf = BufferWriter::new().write_var_int(bn).to_u8_vec();
        self
    }

    pub fn from_u64_new(bn: u64) -> Self {
        let mut varint = Self::new();
        varint.from_u64(bn);
        varint
    }

    pub fn from_u32(&mut self, num: u32) -> &mut Self {
        self.buf = BufferWriter::new().write_var_int(num as u64).to_u8_vec();
        self
    }

    pub fn from_u32_new(num: u32) -> Self {
        let mut varint = Self::new();
        varint.from_u32(num);
        varint
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        self.buf.clone()
    }

    pub fn to_u64(&self) -> u64 {
        BufferReader::new(self.buf.clone()).read_var_int()
    }

    pub fn is_minimal(&self) -> bool {
        let bn = self.to_u64();
        let varint = VarInt::from_u64_new(bn);
        self.buf == varint.to_u8_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_u64() {
        let mut varint = VarInt::new();
        varint.from_u64(1234567890);

        assert_eq!(varint.to_u64(), 1234567890);
    }

    #[test]
    fn test_from_u64_static() {
        let varint = VarInt::from_u64_new(1234567890);

        assert_eq!(varint.to_u64(), 1234567890);
    }

    #[test]
    fn test_from_u32() {
        let mut varint = VarInt::new();
        varint.from_u32(123456789);

        assert_eq!(varint.to_u64(), 123456789);
    }

    #[test]
    fn test_from_u32_static() {
        let varint = VarInt::from_u32_new(123456789);

        assert_eq!(varint.to_u64(), 123456789);
    }

    #[test]
    fn test_to_u8_vec() {
        let mut varint = VarInt::new();
        varint.from_u64(1234567890);
        let vec = varint.to_u8_vec();

        assert!(!vec.is_empty());
    }

    #[test]
    fn test_to_u64() {
        let mut varint = VarInt::new();
        varint.from_u64(1234567890);
        let num = varint.to_u64();

        // Add assertions here based on how VarInt is expected to represent the u64
        // For example, if VarInt has a method 'to_u64' that should return the original u64:
        assert_eq!(num, 1234567890);
    }

    #[test]
    fn test_is_minimal() {
        let mut varint = VarInt::new();
        varint.from_u64(1234567890);

        // Add assertions here based on how VarInt is expected to behave
        // For example, if VarInt is expected to be minimal after being created from a u64:
        assert!(varint.is_minimal());
    }
}
