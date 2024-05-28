use crate::ebx_error::EbxError;
use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;
use crate::opcode::{Opcode, OP, OPCODE_TO_NAME};

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

    pub fn get_data(&self) -> Result<Vec<u8>, EbxError> {
        if self.opcode == Opcode::OP_1NEGATE {
            return Ok(vec![0x80]);
        } else if self.opcode == Opcode::OP_0 {
            return Ok(vec![]);
        } else if Opcode::OP_1 <= self.opcode && self.opcode <= Opcode::OP_16 {
            return Ok(vec![self.opcode - Opcode::OP_1 + 1]);
        }
        match &self.buffer {
            Some(buffer) => Ok(buffer.clone()),
            None => Err(EbxError::NotEnoughDataError { source: None }),
        }
    }

    pub fn to_iso_str(&self) -> Result<String, EbxError> {
        match &self.buffer {
            Some(buffer) => {
                let hex: Vec<String> = buffer.iter().map(|b| format!("{:02x}", b)).collect();
                Ok(format!("0x{}", hex.join("")))
            }
            None => {
                let name = OPCODE_TO_NAME.get(&self.opcode);
                match name {
                    Some(name) => Ok(name.to_string()),
                    None => Err(EbxError::InvalidOpcodeError { source: None }),
                }
            }
        }
    }

    pub fn from_iso_str(str: String) -> Result<ScriptChunk, EbxError> {
        let mut chunk = ScriptChunk::new(0, None);
        if str.starts_with("0x") {
            let buffer = hex::decode(str.strip_prefix("0x").unwrap())
                .map_err(|_| EbxError::InvalidHexError { source: None })?;
            let len = buffer.len();
            chunk.buffer = Some(buffer);
            if len <= 0xff {
                chunk.opcode = Opcode::OP_PUSHDATA1;
            } else if len <= 0xffff {
                chunk.opcode = Opcode::OP_PUSHDATA2;
            } else if len <= 0xffffffff {
                chunk.opcode = Opcode::OP_PUSHDATA4;
            } else {
                return Err(EbxError::TooMuchDataError { source: None });
            }
        } else {
            let opcode = OP.get(&str.as_str());
            match opcode {
                Some(opcode) => chunk.opcode = *opcode,
                None => return Err(EbxError::InvalidOpcodeError { source: None }),
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

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<ScriptChunk, EbxError> {
        let mut reader = IsoBufReader::new(buf);
        ScriptChunk::from_iso_buf_reader(&mut reader)
    }

    pub fn from_iso_buf_reader(reader: &mut IsoBufReader) -> Result<ScriptChunk, EbxError> {
        let opcode = reader.read_u8()?;
        let mut chunk = ScriptChunk::new(opcode, None);
        if opcode == Opcode::OP_PUSHDATA1 {
            let len = reader.read_u8()? as usize;
            chunk.buffer = Some(reader.read(len)?);
            if len == 0 || (len == 1 && (1..=16).contains(&chunk.buffer.as_ref().unwrap()[0])) {
                return Err(EbxError::NonMinimalEncodingError { source: None });
            }
        } else if opcode == Opcode::OP_PUSHDATA2 {
            let len = reader.read_u16_be()? as usize;
            if len <= 0xff {
                return Err(EbxError::NonMinimalEncodingError { source: None });
            }
            chunk.buffer = Some(reader.read(len)?);
        } else if opcode == Opcode::OP_PUSHDATA4 {
            let len = reader.read_u32_be()? as usize;
            if len <= 0xffff {
                return Err(EbxError::NonMinimalEncodingError { source: None });
            }
            chunk.buffer = Some(reader.read(len)?);
        }
        Ok(chunk)
    }

    pub fn from_data(data: Vec<u8>) -> ScriptChunk {
        let len = data.len();
        if len == 0 {
            ScriptChunk::new(Opcode::OP_0, None)
        } else if len == 1 && 1 <= data[0] && data[0] <= 16 {
            ScriptChunk::new(data[0] + Opcode::OP_1 - 1, None)
        } else if len <= 0xff {
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
