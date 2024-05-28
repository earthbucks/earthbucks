use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;

#[derive(Default)]
pub struct VarInt {
    buf: Vec<u8>,
}

impl VarInt {
    pub fn new() -> Self {
        Self { buf: vec![] }
    }

    pub fn from_u64(bn: u64) -> Self {
        let mut varint = Self::new();
        varint.buf = IsoBufWriter::new().write_var_int(bn).to_iso_buf();
        varint
    }

    pub fn from_u32(num: u32) -> Self {
        let mut varint = Self::new();
        varint.buf = IsoBufWriter::new().write_var_int(num as u64).to_iso_buf();
        varint
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        self.buf.clone()
    }

    pub fn to_u64(&self) -> Result<u64, String> {
        IsoBufReader::new(self.buf.clone())
            .read_var_int()
            .map_err(|e| e.to_string())
    }

    pub fn from_iso_buf_reader(br: &mut IsoBufReader) -> Result<Self, String> {
        let buf = br.read_var_int_buf().map_err(|e| e.to_string())?;
        Ok(VarInt { buf })
    }

    pub fn is_minimal(&self) -> bool {
        let res = self.to_u64();
        res.is_ok()
    }
}
