use crate::ebx_error::EbxError;
use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;
use crate::script::Script;
use crate::var_int::VarInt;

#[derive(PartialEq, Debug, Clone, Default)]
pub struct TxOut {
    pub value: u64,
    pub script: Script,
}

impl TxOut {
    pub fn new(value: u64, script: Script) -> Self {
        Self { value, script }
    }

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut reader = IsoBufReader::new(buf);
        let value = reader.read_u64_be()?;
        let script_len = reader.read_var_int()? as usize;
        let script_arr = reader.read(script_len)?;
        let script = match Script::from_iso_buf(&script_arr[..]) {
            Ok(script) => script,
            Err(e) => return Err(e),
        };
        Ok(Self::new(value, script))
    }

    pub fn from_iso_buf_reader(reader: &mut IsoBufReader) -> Result<Self, EbxError> {
        let value = reader.read_u64_be()?;
        let script_len = reader.read_var_int()? as usize;
        let script_arr = reader.read(script_len)?;
        let script = match Script::from_iso_buf(&script_arr[..]) {
            Ok(script) => script,
            Err(e) => return Err(e),
        };
        Ok(Self::new(value, script))
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut writer = IsoBufWriter::new();
        writer.write_u64_be(self.value);
        let script_buf = self.script.to_iso_buf();
        writer.write_iso_buf(VarInt::from_u64(script_buf.len() as u64).to_iso_buf());
        writer.write_iso_buf(script_buf);
        writer.to_iso_buf()
    }
}
