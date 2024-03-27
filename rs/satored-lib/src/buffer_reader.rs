use byteorder::{BigEndian, LittleEndian, ReadBytesExt};
use std::io::Cursor;

pub struct BufferReader {
    buf: Cursor<Vec<u8>>,
}

impl BufferReader {
    pub fn new(buf: Vec<u8>) -> BufferReader {
        BufferReader {
            buf: Cursor::new(buf),
        }
    }

    pub fn eof(&self) -> bool {
        self.buf.position() as usize >= self.buf.get_ref().len()
    }

    pub fn read(&mut self, len: usize) -> Vec<u8> {
        let pos = self.buf.position() as usize;
        let buf = self.buf.get_ref()[pos..pos + len].to_vec();
        self.buf.set_position((pos + len) as u64);
        buf
    }

    pub fn read_reverse(&mut self, len: usize) -> Vec<u8> {
        let pos = self.buf.position() as usize;
        let buf = self.buf.get_ref()[pos..pos + len].to_vec();
        self.buf.set_position((pos + len) as u64);
        buf
    }

    pub fn read_u8(&mut self) -> u8 {
        self.buf.read_u8().unwrap()
    }

    pub fn read_i8(&mut self) -> i8 {
        self.buf.read_i8().unwrap()
    }

    pub fn read_u16_be(&mut self) -> u16 {
        self.buf.read_u16::<BigEndian>().unwrap()
    }

    pub fn read_i16_be(&mut self) -> i16 {
        self.buf.read_i16::<BigEndian>().unwrap()
    }

    pub fn read_u16_le(&mut self) -> u16 {
        self.buf.read_u16::<LittleEndian>().unwrap()
    }

    pub fn read_i16_le(&mut self) -> i16 {
        self.buf.read_i16::<LittleEndian>().unwrap()
    }

    pub fn read_u32_be(&mut self) -> u32 {
        self.buf.read_u32::<BigEndian>().unwrap()
    }

    pub fn read_i32_be(&mut self) -> i32 {
        self.buf.read_i32::<BigEndian>().unwrap()
    }

    pub fn read_u32_le(&mut self) -> u32 {
        self.buf.read_u32::<LittleEndian>().unwrap()
    }

    pub fn read_i32_le(&mut self) -> i32 {
        self.buf.read_i32::<LittleEndian>().unwrap()
    }

    pub fn read_u64_be_big_int(&mut self) -> u64 {
        self.buf.read_u64::<BigEndian>().unwrap()
    }

    pub fn read_u64_le_big_int(&mut self) -> u64 {
        self.buf.read_u64::<LittleEndian>().unwrap()
    }

    pub fn read_var_int_buf(&mut self) -> Vec<u8> {
        let first = self.read_u8();
        match first {
            0xfd => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(2));
                buf
            }
            0xfe => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(4));
                buf
            }
            0xff => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(8));
                buf
            }
            _ => vec![first],
        }
    }

    pub fn read_var_int(&mut self) -> u64 {
        let first = self.read_u8();
        match first {
            0xfd => self.read_u16_le() as u64,
            0xfe => self.read_u32_le() as u64,
            0xff => self.read_u64_le_big_int(),
            _ => first as u64,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read() {
        let mut reader = BufferReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read(3), vec![1, 2, 3]);
        assert_eq!(reader.read(2), vec![4, 5]);
    }

    #[test]
    fn test_read_reverse() {
        let mut reader = BufferReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read_reverse(3), vec![1, 2, 3]);
        assert_eq!(reader.read_reverse(2), vec![4, 5]);
    }

    #[test]
    fn test_read_u8() {
        let mut reader = BufferReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read_u8(), 1);
        assert_eq!(reader.read_u8(), 2);
    }

    #[test]
    fn test_read_i8() {
        let mut reader = BufferReader::new(vec![1, 2, 255, 4, 5]);
        assert_eq!(reader.read_i8(), 1);
        assert_eq!(reader.read_i8(), 2);
        assert_eq!(reader.read_i8(), -1); // 255 is -1 in two's complement
    }

    #[test]
    fn test_read_u16_be() {
        let mut buffer_reader = BufferReader::new(vec![0x01, 0x23]);
        assert_eq!(buffer_reader.read_u16_be(), 0x0123);
    }

    #[test]
    fn test_read_i16_be() {
        use byteorder::{BigEndian, WriteBytesExt};

        let mut data = vec![];
        data.write_i16::<BigEndian>(12345).unwrap();
        data.write_i16::<BigEndian>(-12345).unwrap();

        let mut reader = BufferReader::new(data);
        assert_eq!(reader.read_i16_be(), 12345);
        assert_eq!(reader.read_i16_be(), -12345);
    }
}
