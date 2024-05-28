use crate::ebx_error::EbxError;
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

    pub fn read(&mut self, len: usize) -> Result<Vec<u8>, EbxError> {
        let pos = self.buf.position() as usize;
        if pos + len > self.buf.get_ref().len() {
            return Err(EbxError::NotEnoughDataError { source: None });
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

    pub fn read_u8(&mut self) -> Result<u8, EbxError> {
        self.buf
            .read_u8()
            .map_err(|_| EbxError::NotEnoughDataError { source: None })
    }

    pub fn read_u16_be(&mut self) -> Result<u16, EbxError> {
        self.buf
            .read_u16::<BigEndian>()
            .map_err(|_| EbxError::NotEnoughDataError { source: None })
    }

    pub fn read_u32_be(&mut self) -> Result<u32, EbxError> {
        self.buf
            .read_u32::<BigEndian>()
            .map_err(|_| EbxError::NotEnoughDataError { source: None })
    }

    pub fn read_u64_be(&mut self) -> Result<u64, EbxError> {
        self.buf
            .read_u64::<BigEndian>()
            .map_err(|_| EbxError::NotEnoughDataError { source: None })
    }

    pub fn read_var_int_buf(&mut self) -> Result<Vec<u8>, EbxError> {
        let first = self.read_u8().map_err(|e| EbxError::NotEnoughDataError {
            source: Some(Box::new(e)),
        })?;
        match first {
            0xfd => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(2).map_err(|e| EbxError::NotEnoughDataError {
                    source: Some(Box::new(e)),
                })?);
                if Cursor::new(&buf[1..]).read_u16::<BigEndian>().unwrap() < 0xfd {
                    return Err(EbxError::NonMinimalEncodingError { source: None });
                }
                Ok(buf)
            }
            0xfe => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(4).map_err(|e| EbxError::NotEnoughDataError {
                    source: Some(Box::new(e)),
                })?);

                if Cursor::new(&buf[1..]).read_u32::<BigEndian>().unwrap() < 0x10000 {
                    return Err(EbxError::NonMinimalEncodingError { source: None });
                }
                Ok(buf)
            }
            0xff => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(8).map_err(|e| EbxError::NotEnoughDataError {
                    source: Some(Box::new(e)),
                })?);
                if Cursor::new(&buf[1..]).read_u64::<BigEndian>().unwrap() < 0x100000000 {
                    return Err(EbxError::NonMinimalEncodingError { source: None });
                }
                Ok(buf)
            }
            _ => Ok(vec![first]),
        }
    }

    pub fn read_var_int(&mut self) -> Result<u64, EbxError> {
        let buf = self.read_var_int_buf()?;
        let first = buf[0];
        match first {
            0xfd => Ok(Cursor::new(&buf[1..]).read_u16::<BigEndian>().unwrap() as u64),
            0xfe => Ok(Cursor::new(&buf[1..]).read_u32::<BigEndian>().unwrap() as u64),
            0xff => Ok(Cursor::new(&buf[1..]).read_u64::<BigEndian>().unwrap()),
            _ => Ok(first as u64),
        }
    }
}
