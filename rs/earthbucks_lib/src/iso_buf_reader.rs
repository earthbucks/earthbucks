use byteorder::{BigEndian, ReadBytesExt};
use std::io::Cursor;

#[derive(Debug)]
pub enum IsoBufReaderError {
    ReadError { code: u32, message: String },
    ReadU8Error { code: u32, message: String },
    ReadU16BEError { code: u32, message: String },
    ReadU32BEError { code: u32, message: String },
    ReadU64BEError { code: u32, message: String },
    ReadVarIntBufError { code: u32, message: String },
    ReadVarIntError { code: u32, message: String },
}

impl std::fmt::Display for IsoBufReaderError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            IsoBufReaderError::ReadError { code, message } => {
                write!(f, "IsoBufReader::ReadError ({}): {}", code, message)
            }
            IsoBufReaderError::ReadU8Error { code, message } => {
                write!(f, "IsoBufReader::ReadU8Error ({}): {}", code, message)
            }
            IsoBufReaderError::ReadU16BEError { code, message } => {
                write!(f, "IsoBufReader::ReadU16BEError ({}): {}", code, message)
            }
            IsoBufReaderError::ReadU32BEError { code, message } => {
                write!(f, "IsoBufReader::ReadU32BEError ({}): {}", code, message)
            }
            IsoBufReaderError::ReadU64BEError { code, message } => {
                write!(f, "IsoBufReader::ReadU64BEError ({}): {}", code, message)
            }
            IsoBufReaderError::ReadVarIntBufError { code, message } => {
                write!(
                    f,
                    "IsoBufReader::ReadVarIntBufError ({}): {}",
                    code, message
                )
            }
            IsoBufReaderError::ReadVarIntError { code, message } => {
                write!(f, "IsoBufReader::ReadVarIntError ({}): {}", code, message)
            }
        }
    }
}

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

    pub fn read(&mut self, len: usize) -> Result<Vec<u8>, IsoBufReaderError> {
        let pos = self.buf.position() as usize;
        if pos + len > self.buf.get_ref().len() {
            return Err(IsoBufReaderError::ReadError {
                code: 1,
                message: "not enough bytes left in the buffer to read".to_string(),
            });
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

    pub fn read_u8(&mut self) -> Result<u8, IsoBufReaderError> {
        self.buf
            .read_u8()
            .map_err(|e| IsoBufReaderError::ReadU8Error {
                code: 1,
                message: e.to_string(),
            })
    }

    pub fn read_u16_be(&mut self) -> Result<u16, IsoBufReaderError> {
        self.buf
            .read_u16::<BigEndian>()
            .map_err(|e| IsoBufReaderError::ReadU16BEError {
                code: 1,
                message: e.to_string(),
            })
    }

    pub fn read_u32_be(&mut self) -> Result<u32, IsoBufReaderError> {
        self.buf
            .read_u32::<BigEndian>()
            .map_err(|e| IsoBufReaderError::ReadU32BEError {
                code: 1,
                message: e.to_string(),
            })
    }

    pub fn read_u64_be(&mut self) -> Result<u64, IsoBufReaderError> {
        self.buf
            .read_u64::<BigEndian>()
            .map_err(|e| IsoBufReaderError::ReadU64BEError {
                code: 1,
                message: e.to_string(),
            })
    }

    pub fn read_var_int_buf(&mut self) -> Result<Vec<u8>, IsoBufReaderError> {
        let first = self
            .read_u8()
            .map_err(|e| IsoBufReaderError::ReadVarIntBufError {
                code: 1,
                message: e.to_string(),
            })?;
        match first {
            0xfd => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(2).map_err(|e| {
                    IsoBufReaderError::ReadVarIntBufError {
                        code: 2,
                        message: e.to_string(),
                    }
                })?);
                if Cursor::new(&buf[1..]).read_u16::<BigEndian>().unwrap() < 0xfd {
                    return Err(IsoBufReaderError::ReadVarIntBufError {
                        code: 3,
                        message: "non-minimal varint encoding".to_string(),
                    });
                }
                Ok(buf)
            }
            0xfe => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(4).map_err(|e| {
                    IsoBufReaderError::ReadVarIntBufError {
                        code: 4,
                        message: e.to_string(),
                    }
                })?);
                if Cursor::new(&buf[1..]).read_u32::<BigEndian>().unwrap() < 0x10000 {
                    return Err(IsoBufReaderError::ReadVarIntBufError {
                        code: 5,
                        message: "non-minimal varint encoding".to_string(),
                    });
                }
                Ok(buf)
            }
            0xff => {
                let mut buf = vec![first];
                buf.extend_from_slice(&self.read(8).map_err(|e| {
                    IsoBufReaderError::ReadVarIntBufError {
                        code: 6,
                        message: e.to_string(),
                    }
                })?);
                if Cursor::new(&buf[1..]).read_u64::<BigEndian>().unwrap() < 0x100000000 {
                    return Err(IsoBufReaderError::ReadVarIntBufError {
                        code: 7,
                        message: "non-minimal varint encoding".to_string(),
                    });
                }
                Ok(buf)
            }
            _ => Ok(vec![first]),
        }
    }

    pub fn read_var_int(&mut self) -> Result<u64, IsoBufReaderError> {
        let buf = self.read_var_int_buf().map_err(|e: IsoBufReaderError| {
            IsoBufReaderError::ReadVarIntError {
                code: 1,
                message: "unable to read varint buf: ".to_string() + &e.to_string(),
            }
        })?;
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
    use std::fs;

    use super::*;
    use byteorder::{BigEndian, WriteBytesExt};
    use serde::Deserialize;

    #[test]
    fn test_read() {
        let mut reader = IsoBufReader::new(vec![1, 2, 3, 4, 5]);
        assert_eq!(reader.read(3).unwrap(), vec![1, 2, 3]);
        assert_eq!(reader.read(2).unwrap(), vec![4, 5]);
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
        let data = vec![0xfd, 0x10, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 0x1000 + 1);

        let data = vec![0xfe, 0x10, 0x00, 0x00, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 0x10000000 + 1);

        let data = vec![0xff, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 0x1000000000000000 + 1);

        let data = vec![0x01];
        let mut reader = IsoBufReader::new(data);
        assert_eq!(reader.read_var_int().unwrap(), 1);
    }

    // standard test vectors

    #[derive(Deserialize)]
    struct TestVectorIsoBufReader {
        read: TestVectorReadIsoBuf,
        read_u8: TestVectorReadErrors,
        read_u16_be: TestVectorReadErrors,
        read_u32_be: TestVectorReadErrors,
        read_u64_be: TestVectorReadErrors,
        read_var_int_buf: TestVectorReadErrors,
        read_var_int: TestVectorReadErrors,
    }

    #[derive(Deserialize)]
    struct TestVectorReadIsoBuf {
        errors: Vec<TestVectorReadIsoBufError>,
    }

    #[derive(Deserialize)]
    struct TestVectorReadIsoBufError {
        hex: String,
        len: usize,
        error: String,
    }

    #[derive(Deserialize)]
    struct TestVectorReadErrors {
        errors: Vec<TestVectorReadError>,
    }

    #[derive(Deserialize)]
    struct TestVectorReadError {
        hex: String,
        error: String,
    }

    #[test]
    fn test_vectors_read() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read(test_vector.len);
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_u8() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_u8.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_u8();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_u16_be() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_u16_be.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_u16_be();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_u32_be() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_u32_be.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_u32_be();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_u64_be() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_u64_be.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_u64_be();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_var_int_buf() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_var_int_buf.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_var_int_buf();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }

    #[test]
    fn test_vectors_read_var_int() {
        let data =
            fs::read_to_string("../../json/iso_buf_reader.json").expect("Unable to read file");
        let test_vectors: TestVectorIsoBufReader =
            serde_json::from_str(&data).expect("Unable to parse JSON");
        for test_vector in test_vectors.read_var_int.errors {
            let buf = hex::decode(&test_vector.hex).expect("Failed to decode hex");
            let mut reader = IsoBufReader::new(buf);
            let result = reader.read_var_int();
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }
}
