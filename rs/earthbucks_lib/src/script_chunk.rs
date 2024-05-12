use crate::iso_buf_writer::IsoBufWriter;
use crate::opcode::{Opcode, OP, OPCODE_TO_NAME};
use std::error::Error;

#[derive(Debug, PartialEq, Clone)]
pub struct ScriptChunk {
    pub opcode: u8,
    pub buffer: Option<Vec<u8>>,
}

impl ScriptChunk {
    pub fn new(opcode: u8, arr: Option<Vec<u8>>) -> ScriptChunk {
        ScriptChunk {
            opcode,
            buffer: arr,
        }
    }

    pub fn to_iso_str(&self) -> Result<String, Box<dyn Error>> {
        match &self.buffer {
            Some(buffer) => {
                let hex: Vec<String> = buffer.iter().map(|b| format!("{:02x}", b)).collect();
                Ok(format!("0x{}", hex.join("")))
            }
            None => {
                let name = OPCODE_TO_NAME.get(&self.opcode);
                match name {
                    Some(name) => Ok(name.to_string()),
                    None => Err("invalid opcode".into()),
                }
            }
        }
    }

    pub fn from_iso_str(str: String) -> Result<ScriptChunk, Box<dyn Error>> {
        let mut chunk = ScriptChunk::new(0, None);
        if str.starts_with("0x") {
            let buffer = hex::decode(str.strip_prefix("0x").unwrap())?;
            let len = buffer.len();
            chunk.buffer = Some(buffer);
            if len <= 0xff {
                chunk.opcode = Opcode::OP_PUSHDATA1;
            } else if len <= 0xffff {
                chunk.opcode = Opcode::OP_PUSHDATA2;
            } else if len <= 0xffffffff {
                chunk.opcode = Opcode::OP_PUSHDATA4;
            } else {
                return Err("too much data".into());
            }
        } else {
            let opcode = OP.get(&str.as_str());
            match opcode {
                Some(opcode) => chunk.opcode = *opcode,
                None => return Err("invalid opcode".into()),
            }
            chunk.buffer = None;
        }
        Ok(chunk)
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut result = Vec::new();
        result.push(self.opcode);
        match &self.buffer {
            Some(buffer) => {
                let len = buffer.len();
                if self.opcode == Opcode::OP_PUSHDATA1 {
                    let mut writer = IsoBufWriter::new();
                    writer.write_u8(len as u8);
                    result.extend_from_slice(&writer.to_iso_buf());
                    result.extend_from_slice(buffer);
                } else if self.opcode == Opcode::OP_PUSHDATA2 {
                    let mut writer = IsoBufWriter::new();
                    writer.write_u16_be(len as u16);
                    result.extend_from_slice(&writer.to_iso_buf());
                    result.extend_from_slice(buffer);
                } else if self.opcode == Opcode::OP_PUSHDATA4 {
                    let mut writer = IsoBufWriter::new();
                    writer.write_u32_be(len as u32);
                    result.extend_from_slice(&writer.to_iso_buf());
                    result.extend_from_slice(buffer);
                }
            }
            None => (),
        }
        result
    }

    pub fn from_iso_buf(arr: Vec<u8>) -> Result<ScriptChunk, String> {
        let mut chunk = ScriptChunk::new(0, None);
        let opcode = *arr.first().ok_or("Opcode not found".to_string())?;
        if opcode == Opcode::OP_PUSHDATA1 {
            let len = arr[1] as usize;
            if arr.len() != len + 2 {
                return Err("Buffer length is other than expected".into());
            }
            chunk.opcode = opcode;
            chunk.buffer = Some(arr[2..2 + len].to_vec());
        } else if opcode == Opcode::OP_PUSHDATA2 {
            let len = u16::from_be_bytes([arr[1], arr[2]]) as usize;
            if arr.len() != len + 3 {
                return Err("Buffer length is other than expected".into());
            }
            chunk.opcode = opcode;
            chunk.buffer = Some(arr[3..3 + len].to_vec());
        } else if opcode == Opcode::OP_PUSHDATA4 {
            let len = u32::from_be_bytes([arr[1], arr[2], arr[3], arr[4]]) as usize;
            if arr.len() != len + 5 {
                return Err("Buffer length is other than expected".into());
            }
            chunk.opcode = opcode;
            chunk.buffer = Some(arr[5..5 + len].to_vec());
        } else {
            chunk.opcode = opcode;
            chunk.buffer = None;
        }
        Ok(chunk)
    }

    pub fn from_data(data: Vec<u8>) -> ScriptChunk {
        let len = data.len();
        if len <= 0xff {
            ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(data))
        } else if len <= 0xffff {
            ScriptChunk::new(Opcode::OP_PUSHDATA2, Some(data))
        } else if len <= 0xffffffff {
            ScriptChunk::new(Opcode::OP_PUSHDATA4, Some(data))
        } else {
            ScriptChunk::new(0, None)
        }
    }

    pub fn from_small_number(n: i8) -> ScriptChunk {
        if n == -1 || (1..=16).contains(&n) {
            ScriptChunk::new(n as u8 + Opcode::OP_1 - 1, None)
        } else {
            ScriptChunk::new(0, None)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new() {
        let opcode = 1;
        let buffer = Some(vec![2, 3, 4]);
        let chunk = ScriptChunk::new(opcode, buffer.clone());

        assert_eq!(chunk.opcode, opcode);
        assert_eq!(chunk.buffer, buffer);
    }

    #[test]
    fn test_to_string_if() {
        let chunk = ScriptChunk::new(Opcode::OP_IF, None);
        assert_eq!(chunk.to_iso_str().unwrap(), "IF");
    }

    #[test]
    fn test_to_string_pushdata1() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(vec![1, 2, 3]));
        assert_eq!(chunk.to_iso_str().unwrap(), "0x010203");
    }

    #[test]
    fn test_to_string_pushdata2() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA2, Some(vec![4, 5, 6]));
        assert_eq!(chunk.to_iso_str().unwrap(), "0x040506");
    }

    #[test]
    fn test_to_string_pushdata4() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA4, Some(vec![7, 8, 9]));
        assert_eq!(chunk.to_iso_str().unwrap(), "0x070809");
    }

    #[test]
    fn test_from_iso_str_if() {
        let chunk = ScriptChunk::from_iso_str("IF".to_string()).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_IF);
        assert_eq!(chunk.buffer, None);
    }

    #[test]
    fn test_from_iso_str_pushdata1() {
        let chunk = ScriptChunk::from_iso_str("0x010203".to_string()).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
        assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
    }

    #[test]
    fn test_from_iso_str_pushdata2() {
        let chunk = ScriptChunk::from_iso_str("0x".to_string() + &"01".repeat(256)).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
        assert_eq!(chunk.buffer, Some(vec![1; 256]));
    }

    #[test]
    fn test_from_iso_str_pushdata4() {
        let chunk = ScriptChunk::from_iso_str("0x".to_string() + &"01".repeat(70000)).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
        assert_eq!(chunk.buffer, Some(vec![1; 70000]));
    }

    #[test]
    fn test_from_iso_str_new() {
        let chunk = ScriptChunk::from_iso_str("0x010203".to_string()).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
        assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
    }

    #[test]
    fn test_to_iso_buf_if() {
        let chunk = ScriptChunk::new(Opcode::OP_IF, None);
        assert_eq!(chunk.to_iso_buf(), vec![Opcode::OP_IF]);
    }

    #[test]
    fn test_to_iso_buf_pushdata1() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA1, Some(vec![1, 2, 3]));
        assert_eq!(chunk.to_iso_buf(), vec![Opcode::OP_PUSHDATA1, 3, 1, 2, 3]);
    }

    #[test]
    fn test_to_iso_buf_pushdata2() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA2, Some(vec![1; 256]));
        let mut expected = vec![Opcode::OP_PUSHDATA2, 1, 0];
        expected.extend(vec![1; 256]);
        assert_eq!(chunk.to_iso_buf(), expected);
    }

    #[test]
    fn test_to_iso_buf_pushdata4() {
        let chunk = ScriptChunk::new(Opcode::OP_PUSHDATA4, Some(vec![1; 65536]));
        let mut expected = vec![Opcode::OP_PUSHDATA4, 0, 1, 0, 0];
        expected.extend(vec![1; 65536]);
        assert_eq!(chunk.to_iso_buf(), expected);
    }

    #[test]
    fn test_from_iso_buf_if() {
        let arr = vec![Opcode::OP_IF];
        let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_IF);
        assert_eq!(chunk.buffer, None);
    }

    #[test]
    fn test_from_iso_buf_pushdata1() {
        let mut arr = vec![Opcode::OP_PUSHDATA1, 2];
        arr.extend(vec![1, 2]);
        let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_iso_buf_pushdata2() {
        let mut arr = vec![Opcode::OP_PUSHDATA2, 0, 2];
        arr.extend(vec![1, 2]);
        let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_iso_buf_pushdata4() {
        let mut arr = vec![Opcode::OP_PUSHDATA4, 0, 0, 0, 2];
        arr.extend(vec![1, 2]);
        let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_iso_buf_new_pushdata1() {
        let mut arr = vec![Opcode::OP_PUSHDATA1, 2];
        arr.extend(vec![1, 2]);
        let chunk = ScriptChunk::from_iso_buf(arr).unwrap();
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_data() {
        let data = vec![1, 2, 3];
        let chunk = ScriptChunk::from_data(data.clone());
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA1);
        assert_eq!(chunk.buffer, Some(data));
    }

    #[test]
    fn test_from_data_pushdata2() {
        let data = vec![1; 256];
        let chunk = ScriptChunk::from_data(data.clone());
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA2);
        assert_eq!(chunk.buffer, Some(data));
    }

    #[test]
    fn test_from_data_pushdata4() {
        let data = vec![1; 65536];
        let chunk = ScriptChunk::from_data(data.clone());
        assert_eq!(chunk.opcode, Opcode::OP_PUSHDATA4);
        assert_eq!(chunk.buffer, Some(data));
    }

    #[test]
    fn test_from_iso_buf_pushdata1_error() {
        let arr = vec![Opcode::OP_PUSHDATA1, 2];
        let result = ScriptChunk::from_iso_buf(arr);
        assert!(
            result.is_err(),
            "Expected an error for insufficient buffer length in PUSHDATA1 case"
        );
        match result {
            Err(e) => assert_eq!(e.to_string(), "Buffer length is other than expected"),
            _ => panic!("Expected an error for insufficient buffer length in PUSHDATA1 case"),
        }
    }

    #[test]
    fn test_from_iso_buf_pushdata2_error() {
        let arr = vec![Opcode::OP_PUSHDATA2, 0, 2];
        let result = ScriptChunk::from_iso_buf(arr);
        assert!(
            result.is_err(),
            "Expected an error for insufficient buffer length in PUSHDATA2 case"
        );
        match result {
            Err(e) => assert_eq!(e.to_string(), "Buffer length is other than expected"),
            _ => panic!("Expected an error for insufficient buffer length in PUSHDATA2 case"),
        }
    }

    #[test]
    fn test_from_iso_buf_pushdata4_error() {
        let arr = vec![Opcode::OP_PUSHDATA2, 0, 0, 0, 2];
        let result = ScriptChunk::from_iso_buf(arr);
        assert!(
            result.is_err(),
            "Expected an error for insufficient buffer length in PUSHDATA4 case"
        );
        match result {
            Err(e) => assert_eq!(e.to_string(), "Buffer length is other than expected"),
            _ => panic!("Expected an error for insufficient buffer length in PUSHDATA4 case"),
        }
    }
}
