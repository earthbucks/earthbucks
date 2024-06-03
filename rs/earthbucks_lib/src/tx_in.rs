use crate::buf_reader::BufReader;
use crate::buf_writer::BufWriter;
use crate::ebx_error::EbxError;
use crate::script::Script;
use crate::var_int::VarInt;

// add clone support
#[derive(Clone, Debug)]
pub struct TxIn {
    pub input_tx_id: [u8; 32],
    pub input_tx_out_num: u32,
    pub script: Script,
    pub lock_rel: u32,
}

impl TxIn {
    pub fn new(
        input_tx_id: [u8; 32],
        input_tx_out_num: u32,
        script: Script,
        lock_rel: u32,
    ) -> Self {
        Self {
            input_tx_id,
            input_tx_out_num,
            script,
            lock_rel,
        }
    }

    pub fn from_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut reader = BufReader::new(buf);
        let input_tx_id: [u8; 32] = reader.read(32)?.try_into().unwrap();
        let input_tx_index = reader.read_u32_be()?;
        let size = reader.read_u8()? as usize;
        let script = Script::from_buf(reader.read(size)?.as_slice())?;
        let lock_rel = reader.read_u32_be()?;
        Ok(Self::new(input_tx_id, input_tx_index, script, lock_rel))
    }

    pub fn from_buf_reader(reader: &mut BufReader) -> Result<Self, EbxError> {
        let input_tx_id: [u8; 32] = reader.read(32)?.try_into().unwrap();
        let input_tx_index = reader.read_u32_be()?;
        let size = reader.read_var_int()? as usize;
        let script = Script::from_buf(reader.read(size)?.as_slice())?;
        let lock_rel = reader.read_u32_be()?;
        Ok(Self::new(input_tx_id, input_tx_index, script, lock_rel))
    }

    pub fn to_buf(&self) -> Vec<u8> {
        let mut writer = BufWriter::new();
        writer.write(self.input_tx_id.clone().to_vec());
        writer.write_u32_be(self.input_tx_out_num);
        let script_buf = self.script.to_buf();
        writer.write(VarInt::from_u64(script_buf.len() as u64).to_buf());
        writer.write(script_buf);
        writer.write_u32_be(self.lock_rel);
        writer.to_buf()
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
            input_tx_id: [0; 32],
            input_tx_out_num: 0xffffffff,
            script,
            lock_rel: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tx_input() -> Result<(), String> {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_str("");
        let lock_rel = 0;

        let script_clone = match script {
            Ok(script) => script.clone(),
            Err(_) => return Err("Failed to clone script".to_string()),
        };

        let tx_input = TxIn::new(input_tx_id, input_tx_index, script_clone, lock_rel);

        // Test to_buf
        let buf = tx_input.to_buf();
        assert!(!buf.is_empty());

        // Test from_buf
        let tx_input2 = TxIn::from_buf(buf).map_err(|e| e.to_string())?;
        assert_eq!(tx_input2.input_tx_id, input_tx_id);
        assert_eq!(tx_input2.input_tx_out_num, input_tx_index);
        match (tx_input.script.to_str(), tx_input2.script.to_str()) {
            (Ok(script_str), Ok(expected_script_str)) => {
                assert_eq!(script_str, expected_script_str)
            }
            _ => return Err("Failed to compare scripts".to_string()),
        }
        assert_eq!(tx_input2.lock_rel, lock_rel);
        Ok(())
    }

    #[test]
    fn test_from_buf_reader() {
        let input_tx_id = [0u8; 32];
        let input_tx_index = 1u32;
        let script_hex = "";
        let script = Script::from_str(script_hex);
        let lock_rel = 2u32;

        let script_v8_vec = match script {
            Ok(script) => script.to_buf(),
            Err(_) => panic!("Failed to convert script to u8 vec"),
        };

        let mut writer = BufWriter::new();
        writer.write(input_tx_id.clone().to_vec());
        writer.write_u32_be(input_tx_index);
        writer.write_var_int(script_v8_vec.len() as u64);
        writer.write(script_v8_vec);
        writer.write_u32_be(lock_rel);

        let mut reader = BufReader::new(writer.to_buf());
        let tx_input = TxIn::from_buf_reader(&mut reader).unwrap();

        let script2 = tx_input.script;
        let script2_hex = match script2.to_str() {
            Ok(script2_hex) => script2_hex,
            Err(_) => panic!("Failed to convert script to string"),
        };

        assert_eq!(tx_input.input_tx_id, input_tx_id);
        assert_eq!(tx_input.input_tx_out_num, input_tx_index);
        assert_eq!(script2_hex, script_hex);
        assert_eq!(tx_input.lock_rel, lock_rel);
    }

    #[test]
    fn test_is_null() {
        let tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0,
            script: Script::from_str("0x121212").unwrap(),
            lock_rel: 0,
        };
        assert!(!tx_input.is_null());

        let null_tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0xffffffff,
            script: Script::from_empty(),
            lock_rel: 0,
        };
        assert!(null_tx_input.is_null());
    }

    #[test]
    fn test_is_minimal_lock() {
        let tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0,
            script: Script::from_str("0x121212").unwrap(),
            lock_rel: 0xffffffff,
        };
        assert!(!tx_input.is_minimal_lock());

        let final_tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0xffffffff,
            script: Script::from_empty(),
            lock_rel: 0,
        };
        assert!(final_tx_input.is_minimal_lock());
    }

    #[test]
    fn test_is_coinbase() {
        let tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0,
            script: Script::from_str("0x121212").unwrap(),
            lock_rel: 0,
        };
        assert!(!tx_input.is_coinbase());

        let coinbase_tx_input = TxIn {
            input_tx_id: [0; 32],
            input_tx_out_num: 0xffffffff,
            script: Script::from_empty(),
            lock_rel: 0,
        };
        assert!(coinbase_tx_input.is_coinbase());
    }

    #[test]
    fn test_from_coinbase() {
        let script = Script::from_str("0x121212").unwrap();
        let tx_input = TxIn::from_coinbase(script);

        assert_eq!(tx_input.input_tx_id, [0; 32]);
        assert_eq!(tx_input.input_tx_out_num, 0xffffffff);
        assert_eq!(tx_input.script.to_str().unwrap(), "0x121212");
        assert_eq!(tx_input.lock_rel, 0);
    }
}
