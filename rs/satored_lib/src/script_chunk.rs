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
            Some(buffer) => Ok(format!("0x{:02x?}", buffer)),
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
                self.opcode = *NAME_TO_OPCODE.get("OP_PUSHDATA1").unwrap();
            } else if len <= 0xffff {
                self.opcode = *NAME_TO_OPCODE.get("OP_PUSHDATA2").unwrap();
            } else if len <= 0xffffffff {
                self.opcode = *NAME_TO_OPCODE.get("OP_PUSHDATA4").unwrap();
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

    pub fn to_uint8_array(&self) -> Vec<u8> {
        let mut result = Vec::new();
        result.push(self.opcode);
        match &self.buffer {
            Some(buffer) => {
                let len = buffer.len();
                if self.opcode == *NAME_TO_OPCODE.get("OP_PUSHDATA1").unwrap() {
                    let mut writer = BufferWriter::new();
                    writer.write_u8(len as u8);
                    result.extend_from_slice(&writer.to_u8_vec());
                    result.extend_from_slice(buffer);
                } else if self.opcode == *NAME_TO_OPCODE.get("OP_PUSHDATA2").unwrap() {
                    let mut writer = BufferWriter::new();
                    writer.write_u16_be(len as u16);
                    result.extend_from_slice(&writer.to_u8_vec());
                    result.extend_from_slice(buffer);
                } else if self.opcode == *NAME_TO_OPCODE.get("OP_PUSHDATA4").unwrap() {
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
}
