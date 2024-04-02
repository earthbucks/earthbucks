use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::var_int::VarInt;

pub struct TransactionInput {
    pub input_tx_id: Vec<u8>,
    pub input_tx_index: u32,
    pub script: Script,
    pub sequence: u32,
}

impl TransactionInput {
    pub fn new(input_tx_id: Vec<u8>, input_tx_index: u32, script: Script, sequence: u32) -> Self {
        Self {
            input_tx_id,
            input_tx_index,
            script,
            sequence,
        }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let input_tx_id = reader.read(32);
        let input_tx_index = reader.read_u32_be();
        let size = reader.read_u8() as usize;
        let script = Script::from_u8_vec(reader.read(size as usize).as_slice())?;
        let sequence = reader.read_u32_be();
        Ok(Self::new(input_tx_id, input_tx_index, script, sequence))
    }

    pub fn from_buffer_reader(
        reader: &mut BufferReader,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let input_tx_id = reader.read(32);
        let input_tx_index = reader.read_u32_be();
        let size = reader.read_var_int() as usize;
        let script = Script::from_u8_vec(reader.read(size as usize).as_slice())?;
        let sequence = reader.read_u32_be();
        Ok(Self::new(input_tx_id, input_tx_index, script, sequence))
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut writer = BufferWriter::new();
        writer.write_u8_vec(self.input_tx_id.clone());
        writer.write_u32_be(self.input_tx_index);
        let script_buf = self.script.to_u8_vec();
        writer.write_u8_vec(VarInt::from_u64_new(script_buf.len() as u64).to_u8_vec());
        writer.write_u8_vec(script_buf);
        writer.write_u32_be(self.sequence);
        writer.to_u8_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transaction_input() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("");
        let sequence = 0;

        let script_clone = match script {
            Ok(script) => script.clone(),
            Err(_) => return Err("Failed to clone script".to_string()),
        };

        let tx_input =
            TransactionInput::new(input_tx_id.clone(), input_tx_index, script_clone, sequence);

        // Test to_u8_vec
        let buf = tx_input.to_u8_vec();
        assert!(!buf.is_empty());

        // Test from_u8_vec
        let tx_input2 = TransactionInput::from_u8_vec(buf).map_err(|e| e.to_string())?;
        assert_eq!(tx_input2.input_tx_id, input_tx_id);
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

    #[test]
    fn test_from_buffer_reader() {
        let input_tx_id = vec![0u8; 32];
        let input_tx_index = 1u32;
        let script_hex = "";
        let script = Script::from_string(script_hex);
        let sequence = 2u32;

        let script_v8_vec = match script {
            Ok(script) => script.to_u8_vec(),
            Err(_) => panic!("Failed to convert script to u8 vec"),
        };

        let mut writer = BufferWriter::new();
        writer.write_u8_vec(input_tx_id.clone());
        writer.write_u32_be(input_tx_index);
        writer.write_var_int(script_v8_vec.len() as u64);
        writer.write_u8_vec(script_v8_vec);
        writer.write_u32_be(sequence);

        let mut reader = BufferReader::new(writer.to_u8_vec());
        let transaction_input = TransactionInput::from_buffer_reader(&mut reader).unwrap();

        let script2 = transaction_input.script;
        let script2_hex = match script2.to_string() {
            Ok(script2_hex) => script2_hex,
            Err(_) => panic!("Failed to convert script to string"),
        };

        assert_eq!(transaction_input.input_tx_id, input_tx_id);
        assert_eq!(transaction_input.input_tx_index, input_tx_index);
        assert_eq!(script2_hex, script_hex);
        assert_eq!(transaction_input.sequence, sequence);
    }
}
