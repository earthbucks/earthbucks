use crate::ebx_error::EbxError;
use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;
use crate::script::Script;
use crate::var_int::VarInt;

// add clone support
#[derive(Clone, Debug)]
pub struct TxIn {
    pub input_tx_id: Vec<u8>,
    pub input_tx_out_num: u32,
    pub script: Script,
    pub lock_rel: u32,
}

impl TxIn {
    pub fn new(input_tx_id: Vec<u8>, input_tx_out_num: u32, script: Script, lock_rel: u32) -> Self {
        Self {
            input_tx_id,
            input_tx_out_num,
            script,
            lock_rel,
        }
    }

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut reader = IsoBufReader::new(buf);
        let input_tx_id = reader.read(32)?;
        let input_tx_index = reader.read_u32_be()?;
        let size = reader.read_u8()? as usize;
        let script = Script::from_iso_buf(reader.read(size)?.as_slice())?;
        let lock_rel = reader.read_u32_be()?;
        Ok(Self::new(input_tx_id, input_tx_index, script, lock_rel))
    }

    pub fn from_iso_buf_reader(reader: &mut IsoBufReader) -> Result<Self, EbxError> {
        let input_tx_id = reader.read(32)?;
        let input_tx_index = reader.read_u32_be()?;
        let size = reader.read_var_int()? as usize;
        let script = Script::from_iso_buf(reader.read(size)?.as_slice())?;
        let lock_rel = reader.read_u32_be()?;
        Ok(Self::new(input_tx_id, input_tx_index, script, lock_rel))
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut writer = IsoBufWriter::new();
        writer.write_iso_buf(self.input_tx_id.clone());
        writer.write_u32_be(self.input_tx_out_num);
        let script_buf = self.script.to_iso_buf();
        writer.write_iso_buf(VarInt::from_u64(script_buf.len() as u64).to_iso_buf());
        writer.write_iso_buf(script_buf);
        writer.write_u32_be(self.lock_rel);
        writer.to_iso_buf()
    }

    pub fn is_null(&self) -> bool {
        self.input_tx_id.iter().all(|&byte| byte == 0) && self.input_tx_out_num == 0xffffffff
    }

    pub fn is_minimal_lock(&self) -> bool {
        self.lock_rel == 0
    }

    pub fn is_coinbase(&self) -> bool {
        self.is_null() && self.is_minimal_lock()
    }

    pub fn from_coinbase(script: Script) -> Self {
        Self {
            input_tx_id: vec![0; 32],
            input_tx_out_num: 0xffffffff,
            script,
            lock_rel: 0,
        }
    }
}
