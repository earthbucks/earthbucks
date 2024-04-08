use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::var_int::VarInt;

// add clone support
#[derive(Clone)]
pub struct TxInput {
    pub input_tx_id: Vec<u8>,
    pub input_tx_index: u32,
    pub script: Script,
    pub sequence: u32,
}

impl TxInput {
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
        let input_tx_id = reader.read_u8_vec(32);
        let input_tx_index = reader.read_u32_be();
        let size = reader.read_u8() as usize;
        let script = Script::from_u8_vec(reader.read_u8_vec(size as usize).as_slice())?;
        let sequence = reader.read_u32_be();
        Ok(Self::new(input_tx_id, input_tx_index, script, sequence))
    }

    pub fn from_buffer_reader(
        reader: &mut BufferReader,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let input_tx_id = reader.read_u8_vec(32);
        let input_tx_index = reader.read_u32_be();
        let size = reader.read_var_int() as usize;
        let script = Script::from_u8_vec(reader.read_u8_vec(size as usize).as_slice())?;
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

    pub fn is_null(&self) -> bool {
        self.input_tx_id.iter().all(|&byte| byte == 0) && self.input_tx_index == 0xffffffff
    }

    pub fn is_final(&self) -> bool {
        self.sequence == 0xffffffff
    }

    pub fn is_coinbase(&self) -> bool {
        self.is_null() && self.is_final()
    }

    pub fn from_coinbase(script: Script) -> Self {
        Self {
            input_tx_id: vec![0; 32],
            input_tx_index: 0xffffffff,
            script,
            sequence: 0xffffffff,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tx_input() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("");
        let sequence = 0;

        let script_clone = match script {
            Ok(script) => script.clone(),
            Err(_) => return Err("Failed to clone script".to_string()),
        };

        let tx_input = TxInput::new(input_tx_id.clone(), input_tx_index, script_clone, sequence);

        // Test to_u8_vec
        let buf = tx_input.to_u8_vec();
        assert!(!buf.is_empty());

        // Test from_u8_vec
        let tx_input2 = TxInput::from_u8_vec(buf).map_err(|e| e.to_string())?;
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
        let tx_input = TxInput::from_buffer_reader(&mut reader).unwrap();

        let script2 = tx_input.script;
        let script2_hex = match script2.to_string() {
            Ok(script2_hex) => script2_hex,
            Err(_) => panic!("Failed to convert script to string"),
        };

        assert_eq!(tx_input.input_tx_id, input_tx_id);
        assert_eq!(tx_input.input_tx_index, input_tx_index);
        assert_eq!(script2_hex, script_hex);
        assert_eq!(tx_input.sequence, sequence);
    }

    #[test]
    fn test_is_null() {
        let tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0,
            script: Script::from_string("0x121212").unwrap(),
            sequence: 0,
        };
        assert!(!tx_input.is_null());

        let null_tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0xffffffff,
            script: Script::from_string("").unwrap(),
            sequence: 0xffffffff,
        };
        assert!(null_tx_input.is_null());
    }

    #[test]
    fn test_is_final() {
        let tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0,
            script: Script::from_string("0x121212").unwrap(),
            sequence: 0,
        };
        assert!(!tx_input.is_final());

        let final_tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0xffffffff,
            script: Script::from_string("").unwrap(),
            sequence: 0xffffffff,
        };
        assert!(final_tx_input.is_final());
    }

    #[test]
    fn test_is_coinbase() {
        let tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0,
            script: Script::from_string("0x121212").unwrap(),
            sequence: 0,
        };
        assert!(!tx_input.is_coinbase());

        let coinbase_tx_input = TxInput {
            input_tx_id: [0; 32].to_vec(),
            input_tx_index: 0xffffffff,
            script: Script::from_string("").unwrap(),
            sequence: 0xffffffff,
        };
        assert!(coinbase_tx_input.is_coinbase());
    }

    #[test]
    fn test_from_coinbase() {
        let script = Script::from_string("0x121212").unwrap();
        let tx_input = TxInput::from_coinbase(script);

        assert_eq!(tx_input.input_tx_id, [0; 32].to_vec());
        assert_eq!(tx_input.input_tx_index, 0xffffffff);
        assert_eq!(tx_input.script.to_string().unwrap(), "0x121212");
        assert_eq!(tx_input.sequence, 0xffffffff);
    }
}
