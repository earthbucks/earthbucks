use byteorder::{ByteOrder, LittleEndian, BigEndian, ReadBytesExt};
use std::io::Cursor;

pub struct BufferReader {
    buf: Cursor<Vec<u8>>,
}

impl BufferReader {
    pub fn new(data: Vec<u8>) -> BufferReader {
        BufferReader {
            buf: Cursor::new(data),
        }
    }

    pub fn read_u8(&mut self) -> u8 {
        self.buf.read_u8().unwrap()
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

    // For 64-bit integers, you might want to use BigInt library
    // as Rust's native types only go up to 64 bits
    // and JavaScript's Number can represent up to 2^53
    // Here's a placeholder function
    pub fn read_u64_be_bn(&mut self) -> u64 {
        self.buf.read_u64::<BigEndian>().unwrap()
    }

    pub fn read_u64_le_bn(&mut self) -> u64 {
        self.buf.read_u64::<LittleEndian>().unwrap()
    }

    // For variable length integers, you might need a custom function
    // Here's a placeholder function
    pub fn read_var_int_num(&mut self) -> u64 {
        let first = self.read_u8();
        match first {
            0xfd => self.read_u16_le() as u64,
            0xfe => self.read_u32_le() as u64,
            0xff => self.read_u64_le_bn(),
            _ => first as u64,
        }
    }
}