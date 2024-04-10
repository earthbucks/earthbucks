use hex;

pub struct Buffer {
    pub data: Vec<u8>,
}

impl Buffer {
    // behavior designed to match node.js Buffer.from(hex_string, 'hex')
    pub fn from_hex(hex_string: &str) -> Self {
        let mut hex_string = hex_string
            .to_lowercase()
            .chars()
            .take_while(|c| c.is_digit(16))
            .collect::<String>();
        if hex_string.len() % 2 != 0 {
            hex_string.truncate(hex_string.len() - 1);
        }
        let data = hex::decode(hex_string).unwrap_or_else(|_| Vec::new());
        Self { data }
    }

    pub fn to_hex(&self) -> String {
        hex::encode(&self.data)
    }

    pub fn from(data: Vec<u8>) -> Self {
        Self { data }
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        self.data.clone()
    }

    pub fn alloc(size: usize) -> Self {
        Self {
            data: vec![0; size],
        }
    }
}

// test
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_buffer() {
        let buffer = Buffer::from_hex("1234");
        assert_eq!(buffer.to_hex(), "1234");
        assert_eq!(buffer.to_u8_vec(), vec![0x12, 0x34]);
    }

    #[test]
    fn test_buffer_2() {
        let buffer = Buffer::from_hex("f0f0f0f0f0test");
        assert_eq!(buffer.to_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_3() {
        let buffer = Buffer::from_hex("f0f0f0f0f0testf0");
        assert_eq!(buffer.to_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_4() {
        let buffer = Buffer::from_hex("f0f0f0f0F0testf0");
        assert_eq!(buffer.to_hex(), "f0f0f0f0f0");
    }

    #[test]
    fn test_buffer_5() {
        let buffer = Buffer::from_hex("fff");
        assert_eq!(buffer.to_hex(), "ff");
    }
}
