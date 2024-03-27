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
        let buf = &self.buf.get_ref()[pos..pos + len];
        self.buf.set_position((pos + len) as u64);
        buf.to_vec()
    }

    pub fn read_reverse(&mut self, len: usize) -> Vec<u8> {
        let mut buf = self.read(len);
        buf.reverse();
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
        let first = self.buf.get_ref()[self.buf.position() as usize];
        match first {
            0xfd => self.read(1 + 2),
            0xfe => self.read(1 + 4),
            0xff => self.read(1 + 8),
            _ => self.read(1),
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
