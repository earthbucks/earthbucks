use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::var_int::VarInt;

pub struct TransactionInput {
    pub input_tx_hash: Vec<u8>,
    pub input_tx_index: u32,
    pub script: Script,
    pub sequence: u32,
}

impl TransactionInput {
    pub fn new(input_tx_hash: Vec<u8>, input_tx_index: u32, script: Script, sequence: u32) -> Self {
        Self {
            input_tx_hash,
            input_tx_index,
            script,
            sequence,
        }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let input_tx_hash = reader.read(32);
        let input_tx_index = reader.read_u32_le();
        let size = reader.read_u8() as usize;
        let script = Script::from_u8_vec_new(reader.read(size as usize).as_slice())?;
        let sequence = reader.read_u32_le();
        Ok(Self::new(input_tx_hash, input_tx_index, script, sequence))
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut writer = BufferWriter::new();
        writer.write_u8_vec(self.input_tx_hash.clone());
        writer.write_u32_le(self.input_tx_index);
        let script_buf = self.script.to_u8_vec();
        writer.write_u8_vec(VarInt::from_u64_new(script_buf.len() as u64).to_u8_vec());
        writer.write_u8_vec(script_buf);
        writer.write_u32_le(self.sequence);
        writer.to_u8_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transaction_input() -> Result<(), String> {
        let input_tx_hash = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("");
        let sequence = 0;

        let script_clone = match script {
            Ok(script) => script.clone(),
            Err(_) => return Err("Failed to clone script".to_string()),
        };

        let tx_input = TransactionInput::new(
            input_tx_hash.clone(),
            input_tx_index,
            script_clone,
            sequence,
        );

        // Test to_u8_vec
        let buf = tx_input.to_u8_vec();
        assert!(!buf.is_empty());

        // Test from_u8_vec
        let tx_input2 = TransactionInput::from_u8_vec(buf).map_err(|e| e.to_string())?;
        assert_eq!(tx_input2.input_tx_hash, input_tx_hash);
        assert_eq!(tx_input2.input_tx_index, input_tx_index);
        match (tx_input.script.to_string(), tx_input2.script.to_string()) {
            (Ok(script_str), Ok(expected_script_str)) => {
                assert_eq!(script_str, expected_script_str)
            }
            _ => return Err("Failed to compare scripts".to_string()),
        }
        assert_eq!(tx_input2.sequence, sequence);
        Ok(())
    }
}
