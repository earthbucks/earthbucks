use crate::buffer_writer::BufferWriter;
use crate::opcode::{NAME_TO_OPCODE, OPCODE_TO_NAME};
use std::error::Error;

pub struct ScriptChunk {
    opcode: u8,
    buffer: Option<Vec<u8>>,
}

impl ScriptChunk {
    pub fn new(opcode: u8, arr: Option<Vec<u8>>) -> ScriptChunk {
        ScriptChunk {
            opcode,
            buffer: arr,
        }
    }

    pub fn to_string(&self) -> Result<String, Box<dyn Error>> {
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

    pub fn from_string(&mut self, str: String) -> Result<(), Box<dyn Error>> {
        if str.starts_with("0x") {
            let buffer = hex::decode(&str[2..])?;
            let len = buffer.len();
            self.buffer = Some(buffer);
            if len <= 0xff {
                self.opcode = *NAME_TO_OPCODE.get("PUSHDATA1").unwrap();
            } else if len <= 0xffff {
                self.opcode = *NAME_TO_OPCODE.get("PUSHDATA2").unwrap();
            } else if len <= 0xffffffff {
                self.opcode = *NAME_TO_OPCODE.get("PUSHDATA4").unwrap();
            } else {
                return Err("too much data".into());
            }
        } else {
            let opcode = NAME_TO_OPCODE.get(&str.as_str());
            match opcode {
                Some(opcode) => self.opcode = *opcode,
                None => return Err("invalid opcode".into()),
            }
            self.buffer = None;
        }
        Ok(())
    }

    pub fn from_string_new(str: String) -> Result<ScriptChunk, Box<dyn Error>> {
        let mut chunk = ScriptChunk::new(0, None);
        chunk.from_string(str)?;
        Ok(chunk)
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut result = Vec::new();
        result.push(self.opcode);
        match &self.buffer {
            Some(buffer) => {
                let len = buffer.len();
                if self.opcode == *NAME_TO_OPCODE.get("PUSHDATA1").unwrap() {
                    let mut writer = BufferWriter::new();
                    writer.write_u8(len as u8);
                    result.extend_from_slice(&writer.to_u8_vec());
                    result.extend_from_slice(buffer);
                } else if self.opcode == *NAME_TO_OPCODE.get("PUSHDATA2").unwrap() {
                    let mut writer = BufferWriter::new();
                    writer.write_u16_be(len as u16);
                    result.extend_from_slice(&writer.to_u8_vec());
                    result.extend_from_slice(buffer);
                } else if self.opcode == *NAME_TO_OPCODE.get("PUSHDATA4").unwrap() {
                    let mut writer = BufferWriter::new();
                    writer.write_u32_be(len as u32);
                    result.extend_from_slice(&writer.to_u8_vec());
                    result.extend_from_slice(buffer);
                }
            }
            None => (),
        }
        result
    }

    pub fn from_u8_vec(&mut self, arr: Vec<u8>) -> Result<(), Box<dyn Error>> {
        let opcode = arr[0];
        if opcode == *NAME_TO_OPCODE.get("PUSHDATA1").unwrap() {
            let len = arr[1] as usize;
            self.opcode = opcode;
            self.buffer = Some(arr[2..2 + len].to_vec());
        } else if opcode == *NAME_TO_OPCODE.get("PUSHDATA2").unwrap() {
            let len = u16::from_be_bytes([arr[1], arr[2]]) as usize;
            self.opcode = opcode;
            self.buffer = Some(arr[3..3 + len].to_vec());
        } else if opcode == *NAME_TO_OPCODE.get("PUSHDATA4").unwrap() {
            let len = u32::from_be_bytes([arr[1], arr[2], arr[3], arr[4]]) as usize;
            self.opcode = opcode;
            self.buffer = Some(arr[5..5 + len].to_vec());
        } else {
            self.opcode = opcode;
            self.buffer = None;
        }
        Ok(())
    }

    pub fn from_u8_vec_new(arr: Vec<u8>) -> Result<ScriptChunk, Box<dyn Error>> {
        let mut chunk = ScriptChunk::new(0, None);
        chunk.from_u8_vec(arr)?;
        Ok(chunk)
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
        let chunk = ScriptChunk::new(*NAME_TO_OPCODE.get("IF").unwrap(), None);
        assert_eq!(chunk.to_string().unwrap(), "IF");
    }

    #[test]
    fn test_to_string_pushdata1() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA1").unwrap(),
            Some(vec![1, 2, 3]),
        );
        assert_eq!(chunk.to_string().unwrap(), "0x010203");
    }

    #[test]
    fn test_to_string_pushdata2() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA2").unwrap(),
            Some(vec![4, 5, 6]),
        );
        assert_eq!(chunk.to_string().unwrap(), "0x040506");
    }

    #[test]
    fn test_to_string_pushdata4() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA4").unwrap(),
            Some(vec![7, 8, 9]),
        );
        assert_eq!(chunk.to_string().unwrap(), "0x070809");
    }

    #[test]
    fn test_from_string_if() {
        let mut chunk = ScriptChunk::new(0, None);
        chunk.from_string("IF".to_string()).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("IF").unwrap());
        assert_eq!(chunk.buffer, None);
    }

    #[test]
    fn test_from_string_pushdata1() {
        let mut chunk = ScriptChunk::new(0, None);
        chunk.from_string("0x010203".to_string()).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA1").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
    }

    #[test]
    fn test_from_string_pushdata2() {
        let mut chunk = ScriptChunk::new(0, None);
        chunk
            .from_string("0x".to_string() + &"01".repeat(256))
            .unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA2").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1; 256]));
    }

    #[test]
    fn test_from_string_pushdata4() {
        let mut chunk = ScriptChunk::new(0, None);
        chunk
            .from_string("0x".to_string() + &"01".repeat(70000))
            .unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA4").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1; 70000]));
    }

    #[test]
    fn test_from_string_new() {
        let chunk = ScriptChunk::from_string_new("0x010203".to_string()).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA1").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2, 3]));
    }

    #[test]
    fn test_to_u8_vec_if() {
        let chunk = ScriptChunk::new(*NAME_TO_OPCODE.get("IF").unwrap(), None);
        assert_eq!(chunk.to_u8_vec(), vec![*NAME_TO_OPCODE.get("IF").unwrap()]);
    }

    #[test]
    fn test_to_u8_vec_pushdata1() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA1").unwrap(),
            Some(vec![1, 2, 3]),
        );
        assert_eq!(
            chunk.to_u8_vec(),
            vec![*NAME_TO_OPCODE.get("PUSHDATA1").unwrap(), 3, 1, 2, 3]
        );
    }

    #[test]
    fn test_to_u8_vec_pushdata2() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA2").unwrap(),
            Some(vec![1; 256]),
        );
        let mut expected = vec![*NAME_TO_OPCODE.get("PUSHDATA2").unwrap(), 1, 0];
        expected.extend(vec![1; 256]);
        assert_eq!(chunk.to_u8_vec(), expected);
    }

    #[test]
    fn test_to_u8_vec_pushdata4() {
        let chunk = ScriptChunk::new(
            *NAME_TO_OPCODE.get("PUSHDATA4").unwrap(),
            Some(vec![1; 65536]),
        );
        let mut expected = vec![*NAME_TO_OPCODE.get("PUSHDATA4").unwrap(), 0, 1, 0, 0];
        expected.extend(vec![1; 65536]);
        assert_eq!(chunk.to_u8_vec(), expected);
    }

    #[test]
    fn test_from_u8_vec_if() {
        let mut chunk = ScriptChunk::new(0, None);
        let arr = vec![*NAME_TO_OPCODE.get("IF").unwrap()];
        chunk.from_u8_vec(arr).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("IF").unwrap());
        assert_eq!(chunk.buffer, None);
    }

    #[test]
    fn test_from_u8_vec_pushdata1() {
        let mut chunk = ScriptChunk::new(0, None);
        let mut arr = vec![*NAME_TO_OPCODE.get("PUSHDATA1").unwrap(), 2];
        arr.extend(vec![1, 2]);
        chunk.from_u8_vec(arr).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA1").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_u8_vec_pushdata2() {
        let mut chunk = ScriptChunk::new(0, None);
        let mut arr = vec![*NAME_TO_OPCODE.get("PUSHDATA2").unwrap(), 0, 2];
        arr.extend(vec![1, 2]);
        chunk.from_u8_vec(arr).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA2").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_u8_vec_pushdata4() {
        let mut chunk = ScriptChunk::new(0, None);
        let mut arr = vec![*NAME_TO_OPCODE.get("PUSHDATA4").unwrap(), 0, 0, 0, 2];
        arr.extend(vec![1, 2]);
        chunk.from_u8_vec(arr).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA4").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }

    #[test]
    fn test_from_u8_vec_new_pushdata1() {
        let mut arr = vec![*NAME_TO_OPCODE.get("PUSHDATA1").unwrap(), 2];
        arr.extend(vec![1, 2]);
        let chunk = ScriptChunk::from_u8_vec_new(arr).unwrap();
        assert_eq!(chunk.opcode, *NAME_TO_OPCODE.get("PUSHDATA1").unwrap());
        assert_eq!(chunk.buffer, Some(vec![1, 2]));
    }
}
