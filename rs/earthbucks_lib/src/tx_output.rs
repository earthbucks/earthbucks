use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::var_int::VarInt;

#[derive(PartialEq, Debug, Clone)]
pub struct TxOutput {
    pub value: u64,
    pub script: Script,
}

impl TxOutput {
    pub fn new(value: u64, script: Script) -> Self {
        Self { value, script }
    }

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let value = reader.read_u64_be();
        let script_len = reader.read_var_int() as usize;
        let script_arr = reader.read_u8_vec(script_len);
        let script = match Script::from_iso_buf(&script_arr[..]) {
            Ok(script) => script,
            Err(e) => return Err(e),
        };
        Ok(Self::new(value, script))
    }

    pub fn from_buffer_reader(
        reader: &mut BufferReader,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let value = reader.read_u64_be();
        let script_len = reader.read_var_int() as usize;
        let script_arr = reader.read_u8_vec(script_len);
        let script = match Script::from_iso_buf(&script_arr[..]) {
            Ok(script) => script,
            Err(e) => return Err(e),
        };
        Ok(Self::new(value, script))
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut writer = BufferWriter::new();
        writer.write_u64_be(self.value);
        let script_buf = self.script.to_iso_buf();
        writer.write_u8_vec(VarInt::from_u64_new(script_buf.len() as u64).to_iso_buf());
        writer.write_u8_vec(script_buf);
        writer.to_iso_buf()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn test_tx_output_from_iso_buf_and_to_iso_buf() {
        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);
        let result = TxOutput::from_iso_buf(tx_output.to_iso_buf());
        let result = match result {
            Ok(tx_output) => tx_output,
            Err(e) => panic!("{}", e),
        };
        assert_eq!(
            hex::encode(tx_output.to_iso_buf()),
            hex::encode(result.to_iso_buf())
        );
    }

    #[test]
    fn test_big_push_data() {
        let data = vec![0u8; 0xffff];
        let value = 100;
        let script = Script::from_string(&format!("0x{} DOUBLEBLAKE3", hex::encode(data))).unwrap();
        let tx_output = TxOutput::new(value, script);
        let result = TxOutput::from_iso_buf(tx_output.to_iso_buf()).unwrap();
        assert_eq!(
            hex::encode(tx_output.to_iso_buf()),
            hex::encode(result.to_iso_buf())
        );
    }

    #[test]
    fn test_buffer_reader() {
        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);
        let result =
            TxOutput::from_buffer_reader(&mut BufferReader::new(tx_output.to_iso_buf())).unwrap();
        assert_eq!(
            hex::encode(tx_output.to_iso_buf()),
            hex::encode(result.to_iso_buf())
        );
    }
}
