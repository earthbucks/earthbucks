use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::transaction_input::TransactionInput;
use crate::transaction_output::TransactionOutput;
use crate::var_int::VarInt;

pub struct Transaction {
    pub version: u32,
    pub inputs: Vec<TransactionInput>,
    pub outputs: Vec<TransactionOutput>,
    pub lock_time: u64,
}

impl Transaction {
    pub fn new(
        version: u32,
        inputs: Vec<TransactionInput>,
        outputs: Vec<TransactionOutput>,
        lock_time: u64,
    ) -> Self {
        Self {
            version,
            inputs,
            outputs,
            lock_time,
        }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let version = reader.read_u32_be();
        let input_count = reader.read_var_int() as usize;
        let mut inputs = Vec::new();
        for _ in 0..input_count {
            inputs.push(TransactionInput::from_buffer_reader(&mut reader)?);
        }
        let output_count = reader.read_var_int() as usize;
        let mut outputs = Vec::new();
        for _ in 0..output_count {
            outputs.push(TransactionOutput::from_buffer_reader(&mut reader)?);
        }
        let lock_time = reader.read_u64_be();
        Ok(Self::new(version, inputs, outputs, lock_time))
    }

    pub fn from_buffer_reader(
        reader: &mut BufferReader,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let version = reader.read_u32_be();
        let input_count = reader.read_var_int() as usize;
        let mut inputs = Vec::new();
        for _ in 0..input_count {
            inputs.push(TransactionInput::from_buffer_reader(reader)?);
        }
        let output_count = reader.read_var_int() as usize;
        let mut outputs = Vec::new();
        for _ in 0..output_count {
            outputs.push(TransactionOutput::from_buffer_reader(reader)?);
        }
        let lock_time = reader.read_u64_be();
        Ok(Self::new(version, inputs, outputs, lock_time))
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut writer = BufferWriter::new();
        writer.write_u32_be(self.version);
        writer.write_u8_vec(VarInt::from_u64_new(self.inputs.len() as u64).to_u8_vec());
        for input in &self.inputs {
            writer.write_u8_vec(input.to_u8_vec());
        }
        writer.write_u8_vec(VarInt::from_u64_new(self.outputs.len() as u64).to_u8_vec());
        for output in &self.outputs {
            writer.write_u8_vec(output.to_u8_vec());
        }
        writer.write_u64_be(self.lock_time);
        writer.to_u8_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn test_transaction() -> Result<(), String> {
        let input_tx_hash = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_hash, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let transaction_output = TransactionOutput::new(value, script);

        let version = 1;
        let inputs = vec![transaction_input];
        let outputs = vec![transaction_output];
        let lock_time = 0;
        let transaction = Transaction::new(version, inputs, outputs, lock_time);

        let buf = transaction.to_u8_vec();
        let transaction2 = Transaction::from_u8_vec(buf).unwrap();
        assert_eq!(transaction.version, transaction2.version);
        assert_eq!(transaction.inputs.len(), transaction2.inputs.len());
        assert_eq!(transaction.outputs.len(), transaction2.outputs.len());
        assert_eq!(transaction.lock_time, transaction2.lock_time);
        Ok(())
    }

    #[test]
    fn test_from_buffer_reader() -> Result<(), String> {
        let input_tx_hash = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_hash, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("HASH160 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let transaction_output = TransactionOutput::new(value, script);

        let version = 1;
        let inputs = vec![transaction_input];
        let outputs = vec![transaction_output];
        let lock_time = 0;
        let transaction = Transaction::new(version, inputs, outputs, lock_time);

        let buf = transaction.to_u8_vec();
        let mut reader = BufferReader::new(buf);
        let transaction2 = Transaction::from_buffer_reader(&mut reader).unwrap();
        assert_eq!(transaction.version, transaction2.version);
        assert_eq!(transaction.inputs.len(), transaction2.inputs.len());
        assert_eq!(transaction.outputs.len(), transaction2.outputs.len());
        assert_eq!(transaction.lock_time, transaction2.lock_time);
        Ok(())
    }
}
