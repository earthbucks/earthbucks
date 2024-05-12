use byteorder::{BigEndian, ReadBytesExt};
use std::io::Cursor;

pub struct IsoBufReader {
    buf: Cursor<Vec<u8>>,
}

impl IsoBufReader {
    pub fn new(buf: Vec<u8>) -> IsoBufReader {
        IsoBufReader {
            buf: Cursor::new(buf),
        }
    }

    pub fn eof(&self) -> bool {
        self.buf.position() as usize >= self.buf.get_ref().len()
    }

    pub fn remainder_len(&self) -> usize {
        self.buf.get_ref().len() - self.buf.position() as usize
    }

    pub fn read_iso_buf(&mut self, len: usize) -> Result<Vec<u8>, String> {
        let pos = self.buf.position() as usize;
        if pos + len > self.buf.get_ref().len() {
            return Err("read_iso_but: Not enough bytes left in the buffer to read".to_string());
        }
        let buf = self.buf.get_ref()[pos..pos + len].to_vec();
        self.buf.set_position((pos + len) as u64);
        Ok(buf)
    }

    pub fn read_remainder(&mut self) -> Vec<u8> {
        let pos = self.buf.position() as usize;
        let buf = self.buf.get_ref()[pos..].to_vec();
        self.buf.set_position(self.buf.get_ref().len() as u64);
        buf
    }

    pub fn read_u8(&mut self) -> Result<u8, String> {
        self.buf
            .read_u8()
            .map_err(|e| "Unable to read u8: ".to_string() + &e.to_string())
    }

    pub fn read_u16_be(&mut self) -> Result<u16, String> {
        self.buf
            .read_u16::<BigEndian>()
            .map_err(|e| "Unable to read u16: ".to_string() + &e.to_string())
    }

    pub fn read_u32_be(&mut self) -> Result<u32, String> {
        self.buf
            .read_u32::<BigEndian>()
            .map_err(|e| "Unable to read u32: ".to_string() + &e.to_string())
    }

    pub fn read_u64_be(&mut self) -> Result<u64, String> {
        self.buf
            .read_u64::<BigEndian>()
            .map_err(|e| "Unable to read u64: ".to_string() + &e.to_string())
    }

    pub fn read_var_int_buf(&mut self) -> Result<Vec<u8>, String> {
        let first = self
            .read_u8()
            .map_err(|e| "read_var_int_buf 1: ".to_string() + &e)?;
        match first {
            0xfd => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read_iso_buf(2).map_err(|e| {
                    "read_var_int_buf 2: could not read 2 bytes: ".to_string() + &e
                })?);
                if Cursor::new(&buf).read_u16::<BigEndian>().unwrap() < 0xfd {
                    return Err("read_var_int_buf 2: Non-minimal varint encoding 1".to_string());
                }
                Ok(buf)
            }
            0xfe => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read_iso_buf(4).map_err(|e| {
                    "read_var_int_buf 3: could not read 4 bytes: ".to_string() + &e
                })?);
                if Cursor::new(&buf).read_u32::<BigEndian>().unwrap() < 0x10000 {
                    return Err("read_var_int_buf 3: Non-minimal varint encoding 2".to_string());
                }
                Ok(buf)
            }
            0xff => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read_iso_buf(8)?);
                if Cursor::new(&buf).read_u64::<BigEndian>().unwrap() < 0x100000000 {
                    return Err("read_var_int_buf 4: Non-minimal varint encoding 3".to_string());
                }
                Ok(buf)
            }
            _ => Ok(vec![first]),
        }
    }

    pub fn read_var_int(&mut self) -> Result<u64, String> {
        let buf = self
            .read_var_int_buf()
            .map_err(|e| "read_var_int 1: ".to_string() + &e)?;
        let first = buf[0];
        match first {
            0xfd => Ok(Cursor::new(&buf[1..]).read_u16::<BigEndian>().unwrap() as u64),
            0xfe => Ok(Cursor::new(&buf[1..]).read_u32::<BigEndian>().unwrap() as u64),
            0xff => Ok(Cursor::new(&buf[1..]).read_u64::<BigEndian>().unwrap()),
            _ => Ok(first as u64),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use byteorder::{BigEndian, WriteBytesExt};

    #[test]
    fn test_read() {
        let mut reader = IsoBufReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read_iso_buf(3).unwrap(), vec![1, 2, 3]);
        assert_eq!(reader.read_iso_buf(2).unwrap(), vec![4, 5]);
    }

    #[test]
    fn test_read_u8() {
        let mut reader = IsoBufReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read_u8().unwrap(), 1);
        assert_eq!(reader.read_u8().unwrap(), 2);
    }

    #[test]
    fn test_read_u16_be() {
        let mut buffer_reader = IsoBufReader::new(vec![0x01, 0x23]);
        assert_eq!(buffer_reader.read_u16_be().unwrap(), 0x0123);
    }

    #[test]
    fn test_read_u32_be() {
        let mut data = vec![];
        data.write_u32::<BigEndian>(1234567890).unwrap();
        data.write_u32::<BigEndian>(987654321).unwrap();

        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_u32_be().unwrap(), 1234567890);
        assert_eq!(reader.read_u32_be().unwrap(), 987654321);
    }

    #[test]
    fn test_read_u64_be_big_int() {
        let mut data = vec![];
        data.write_u64::<BigEndian>(12345678901234567890).unwrap();
        data.write_u64::<BigEndian>(9876543210987654321).unwrap();

        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_u64_be().unwrap(), 12345678901234567890);
        assert_eq!(reader.read_u64_be().unwrap(), 9876543210987654321);
    }

    #[test]
    fn test_read_var_int_buf() {
        let data = vec![0xfd, 0x01, 0x00];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int_buf().unwrap(), vec![0xfd, 0x01, 0x00]);

        let data = vec![0xfe, 0x01, 0x00, 0x00, 0x00];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(
            reader.read_var_int_buf().unwrap(),
            vec![0xfe, 0x01, 0x00, 0x00, 0x00]
        );

        let data = vec![0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(
            reader.read_var_int_buf().unwrap(),
            vec![0xff, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        );

        let data = vec![0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int_buf().unwrap(), vec![0x01]);
    }

    #[test]
    fn test_read_var_int() {
        let data = vec![0xfd, 0x00, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 1);

        let data = vec![0xfe, 0x00, 0x00, 0x00, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 1);

        let data = vec![0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 1);

        let data = vec![0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 1);
    }
}
