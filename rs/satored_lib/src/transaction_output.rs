use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::var_int::VarInt;

pub struct TransactionOutput {
    value: u64,
    script: Script,
}

impl TransactionOutput {
    pub fn new(value: u64, script: Script) -> Self {
        Self { value, script }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let value = reader.read_u64_be();
        let script_len = reader.read_var_int() as usize;
        let script_arr = reader.read(script_len);
        let script = match Script::from_u8_vec_new(&script_arr[..]) {
            Ok(script) => script,
            Err(e) => return Err(e),
        };
        Ok(Self::new(value, script))
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut writer = BufferWriter::new();
        writer.write_u64_be(self.value);
        let script_buf = self.script.to_u8_vec();
        writer.write_u8_vec(VarInt::from_u64_new(script_buf.len() as u64).to_u8_vec());
        writer.write_u8_vec(script_buf);
        writer.to_u8_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn test_transaction_output_from_u8_vec_and_to_u8_vec() {
        let value = 100;
        let script = Script::from_string_new("HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let transaction_output = TransactionOutput::new(value, script);
        let result = TransactionOutput::from_u8_vec(transaction_output.to_u8_vec());
        let result = match result {
            Ok(transaction_output) => transaction_output,
            Err(e) => panic!("{}", e),
        };
        assert_eq!(
            hex::encode(transaction_output.to_u8_vec()),
            hex::encode(result.to_u8_vec())
        );
    }

    #[test]
    fn test_big_push_data() {
        let data = vec![0u8; 0xffff];
        let value = 100;
        let script = Script::from_string_new(&format!("0x{} HASH160", hex::encode(data))).unwrap();
        let transaction_output = TransactionOutput::new(value, script);
        let result = TransactionOutput::from_u8_vec(transaction_output.to_u8_vec()).unwrap();
        assert_eq!(
            hex::encode(transaction_output.to_u8_vec()),
            hex::encode(result.to_u8_vec())
        );
    }
}
