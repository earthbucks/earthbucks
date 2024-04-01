use crate::blake3::blake3_hash;
use crate::blake3::double_blake3_hash;
use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::transaction_input::TransactionInput;
use crate::transaction_output::TransactionOutput;
use crate::var_int::VarInt;

pub struct Transaction {
    pub version: u8,
    pub inputs: Vec<TransactionInput>,
    pub outputs: Vec<TransactionOutput>,
    pub lock_time: u64,
    prevouts_hash: Option<Vec<u8>>,
    sequence_hash: Option<Vec<u8>>,
    outputs_hash: Option<Vec<u8>>,
}

impl Transaction {
    pub fn new(
        version: u8,
        inputs: Vec<TransactionInput>,
        outputs: Vec<TransactionOutput>,
        lock_time: u64,
    ) -> Self {
        Self {
            version,
            inputs,
            outputs,
            lock_time,
            prevouts_hash: None,
            sequence_hash: None,
            outputs_hash: None,
        }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        let version = reader.read_u8();
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
        let version = reader.read_u8();
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
        writer.write_u8(self.version);
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

    pub fn blake3_hash(&self) -> Vec<u8> {
        blake3_hash(&self.to_u8_vec()).to_vec()
    }

    pub fn id(&self) -> Vec<u8> {
        double_blake3_hash(&self.to_u8_vec()).to_vec()
    }

    pub fn hash_prevouts(&mut self) -> Vec<u8> {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.input_tx_id);
            data.extend(&input.input_tx_index.to_be_bytes());
        }
        self.prevouts_hash = Some(double_blake3_hash(&data).to_vec());
        self.prevouts_hash.clone().unwrap()
    }

    pub fn hash_sequence(&mut self) -> Vec<u8> {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.sequence.to_le_bytes());
        }
        self.sequence_hash = Some(double_blake3_hash(&data).to_vec());
        self.sequence_hash.clone().unwrap()
    }

    pub fn hash_outputs(&mut self) -> Vec<u8> {
        let mut data = Vec::new();
        for output in &self.outputs {
            data.extend(&output.to_u8_vec());
        }
        self.outputs_hash = Some(double_blake3_hash(&data).to_vec());
        self.outputs_hash.clone().unwrap()
    }

    pub fn sighash_preimage(
        &mut self,
        input_index: usize,
        script_u8_vec: Vec<u8>,
        amount: u64,
        hash_type: u32,
    ) -> Vec<u8> {
        const SIGHASH_ANYONECANPAY: u32 = 0x80;
        const SIGHASH_SINGLE: u32 = 0x03;
        const SIGHASH_NONE: u32 = 0x02;

        let mut prevouts_hash = vec![0; 32];
        let mut sequence_hash = vec![0; 32];
        let mut outputs_hash = vec![0; 32];

        if hash_type & SIGHASH_ANYONECANPAY == 0 {
            prevouts_hash = self
                .prevouts_hash
                .clone()
                .unwrap_or_else(|| self.hash_prevouts());
        }

        if hash_type & SIGHASH_ANYONECANPAY == 0
            && hash_type & 0x1f != SIGHASH_SINGLE
            && hash_type & 0x1f != SIGHASH_NONE
        {
            sequence_hash = self
                .sequence_hash
                .clone()
                .unwrap_or_else(|| self.hash_sequence());
        }

        if hash_type & 0x1f != SIGHASH_SINGLE && hash_type & 0x1f != SIGHASH_NONE {
            outputs_hash = self
                .outputs_hash
                .clone()
                .unwrap_or_else(|| self.hash_outputs());
        } else if hash_type & 0x1f == SIGHASH_SINGLE && input_index < self.outputs.len() {
            outputs_hash = double_blake3_hash(&self.outputs[input_index].to_u8_vec()).to_vec();
        }

        let mut bw = BufferWriter::new();
        bw.write_u8(self.version);
        bw.write_u8_vec(prevouts_hash);
        bw.write_u8_vec(sequence_hash);
        bw.write_u8_vec(self.inputs[input_index].input_tx_id.clone());
        bw.write_u32_be(self.inputs[input_index].input_tx_index);
        bw.write_var_int(script_u8_vec.len() as u64);
        bw.write_u8_vec(script_u8_vec);
        bw.write_u64_be(amount);
        bw.write_u32_be(self.inputs[input_index].sequence);
        bw.write_u8_vec(outputs_hash);
        bw.write_u64_be(self.lock_time);
        bw.write_u32_be(hash_type);
        bw.to_u8_vec()
    }

    pub fn sighash(
        &mut self,
        input_index: usize,
        script_u8_vec: Vec<u8>,
        amount: u64,
        hash_type: u32,
    ) -> Vec<u8> {
        let preimage = self.sighash_preimage(input_index, script_u8_vec, amount, hash_type);
        double_blake3_hash(&preimage).to_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::script::Script;

    #[test]
    fn test_transaction() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
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
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
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

    #[test]
    fn test_hash_once() {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let transaction_output = TransactionOutput::new(value, script);

        let version = 1;
        let inputs = vec![transaction_input];
        let outputs = vec![transaction_output];
        let lock_time = 0;
        let transaction = Transaction::new(version, inputs, outputs, lock_time);
        let expected_hash = blake3_hash(&transaction.to_u8_vec()).to_vec();
        assert_eq!(transaction.blake3_hash(), expected_hash);
    }

    #[test]
    fn test_hash() {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let transaction_input =
            TransactionInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string_new("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let transaction_output = TransactionOutput::new(value, script);

        let version = 1;
        let inputs = vec![transaction_input];
        let outputs = vec![transaction_output];
        let lock_time = 0;
        let transaction = Transaction::new(version, inputs, outputs, lock_time);
        let expected_hash = double_blake3_hash(&transaction.to_u8_vec()).to_vec();
        assert_eq!(transaction.id(), expected_hash);
    }

    #[test]
    fn hash_prevouts() {
        let version = 1;
        let inputs = vec![TransactionInput::new(
            vec![0; 32],
            0,
            Script::from_string_new("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TransactionOutput::new(
            100 as u64,
            Script::from_string_new("").unwrap(),
        )];

        let mut transaction = Transaction::new(version, inputs, outputs, 0 as u64);

        let result = transaction.hash_prevouts();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn hash_sequence() {
        let version = 1;
        let inputs = vec![TransactionInput::new(
            vec![0; 32],
            0,
            Script::from_string_new("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TransactionOutput::new(
            100 as u64,
            Script::from_string_new("").unwrap(),
        )];

        let mut transaction = Transaction::new(version, inputs, outputs, 0 as u64);

        let result = transaction.hash_sequence();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("5c9bc5bfc9fe60992fb5432ba6d5da1b5e232127b6a5678f93063b2d766cfbf5")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn hash_outputs() {
        let version = 1;
        let inputs = vec![TransactionInput::new(
            vec![0; 32],
            0,
            Script::from_string_new("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TransactionOutput::new(
            100 as u64,
            Script::from_string_new("").unwrap(),
        )];

        let mut transaction = Transaction::new(version, inputs, outputs, 0 as u64);

        let result = transaction.hash_outputs();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_sighash() {
        let version = 1;
        let inputs = vec![TransactionInput::new(
            vec![0; 32],
            0,
            Script::from_string_new("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TransactionOutput::new(
            100 as u64,
            Script::from_string_new("").unwrap(),
        )];

        let mut transaction = Transaction::new(version, inputs, outputs, 0 as u64);

        let script = Script::from_string_new("").unwrap();
        let amount = 1;
        let hash_type = 1;
        let preimage = transaction.sighash(0, script.to_u8_vec(), amount, hash_type);

        let expected =
            hex::decode("ff69befa9a79812747d1270a0cba212e4f6eaefa8a69054e6a48627c6b8cd5c7")
                .unwrap();
        assert_eq!(preimage, expected);
    }
}
