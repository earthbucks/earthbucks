use hex;
use std::ops::{Deref, DerefMut};

pub struct Buffer {
    pub data: Vec<u8>,
}

impl Buffer {
    // behavior designed to match node.js Buffer.from(hex_string, 'hex')
    pub fn from_iso_hex(hex_string: &str) -> Self {
        let mut hex_string = hex_string
            .to_lowercase()
            .chars()
            .take_while(|c| c.is_ascii_hexdigit())
            .collect::<String>();
        if hex_string.len() % 2 != 0 {
            hex_string.truncate(hex_string.len() - 1);
        }
        let data = hex::decode(hex_string).unwrap_or_else(|_| Vec::new());
        Self { data }
    }

    pub fn to_iso_hex(&self) -> String {
        hex::encode(&self.data)
    }

    pub fn from(data: Vec<u8>) -> Self {
        Self { data }
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        self.data.clone()
    }

    pub fn alloc(size: usize) -> Self {
        Self {
            data: vec![0; size],
        }
    }
}

impl Deref for Buffer {
    type Target = Vec<u8>;

    fn deref(&self) -> &Self::Target {
        &self.data
    }
}

impl DerefMut for Buffer {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.data
    }
}

// test
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_buffer() {
        let buffer = Buffer::from_iso_hex("1234");
        assert_eq!(buffer.to_iso_hex(), "1234");
        assert_eq!(buffer.to_iso_buf(), vec![0x12, 0x34]);
    }

    #[test]
    fn test_buffer_2() {
        let buffer = Buffer::from_iso_hex("f0f0f0f0f0test");
        assert_eq!(buffer.to_iso_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_3() {
        let buffer = Buffer::from_iso_hex("f0f0f0f0f0testf0");
        assert_eq!(buffer.to_iso_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_4() {
        let buffer = Buffer::from_iso_hex("f0f0f0f0F0testf0");
        assert_eq!(buffer.to_iso_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_5() {
        let buffer = Buffer::from_iso_hex("fff");
        assert_eq!(buffer.to_iso_hex(), "ff");
    }

    #[test]
    fn test_vector_operations() {
        let mut buffer = Buffer::from_iso_hex("1234");
        buffer.push(0x56);
        assert_eq!(buffer.to_iso_hex(), "123456");
        buffer.pop();
        assert_eq!(buffer.to_iso_hex(), "1234");
        buffer.extend_from_slice(&[0x56, 0x78]);
        assert_eq!(buffer.to_iso_hex(), "12345678");
        buffer.truncate(1);
        assert_eq!(buffer.to_iso_hex(), "12");
    }
}
