use crate::blake3::blake3_hash;
use crate::blake3::double_blake3_hash;
use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use crate::script::Script;
use crate::tx_input::TxInput;
use crate::tx_output::TxOutput;
use crate::tx_signature::TxSignature;
use crate::var_int::VarInt;
use secp256k1::ecdsa::Signature;
use secp256k1::{Message, PublicKey, Secp256k1};

pub struct HashCache {
    pub prevouts_hash: Option<Vec<u8>>,
    pub sequence_hash: Option<Vec<u8>>,
    pub outputs_hash: Option<Vec<u8>>,
}

impl HashCache {
    pub fn new() -> Self {
        Self {
            prevouts_hash: None,
            sequence_hash: None,
            outputs_hash: None,
        }
    }
}

// add clone support
#[derive(Clone)]
pub struct Tx {
    pub version: u8,
    pub inputs: Vec<TxInput>,
    pub outputs: Vec<TxOutput>,
    pub lock_time: u64,
}

impl Tx {
    pub fn new(version: u8, inputs: Vec<TxInput>, outputs: Vec<TxOutput>, lock_time: u64) -> Self {
        Self {
            version,
            inputs,
            outputs,
            lock_time,
        }
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Self, Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(buf);
        Self::from_buffer_reader(&mut reader)
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        self.to_buffer_writer().to_u8_vec()
    }

    pub fn from_buffer_reader(
        reader: &mut BufferReader,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let version = reader.read_u8();
        let input_count = reader.read_var_int() as usize;
        let mut inputs = Vec::new();
        for _ in 0..input_count {
            inputs.push(TxInput::from_buffer_reader(reader)?);
        }
        let output_count = reader.read_var_int() as usize;
        let mut outputs = Vec::new();
        for _ in 0..output_count {
            outputs.push(TxOutput::from_buffer_reader(reader)?);
        }
        let lock_time = reader.read_u64_be();
        Ok(Self::new(version, inputs, outputs, lock_time))
    }

    pub fn to_buffer_writer(&self) -> BufferWriter {
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
        writer
    }

    pub fn to_hex(&self) -> String {
        hex::encode(self.to_u8_vec())
    }

    pub fn to_string(&self) -> String {
        hex::encode(self.to_u8_vec())
    }

    pub fn from_string(hex: &str) -> Result<Self, Box<dyn std::error::Error>> {
        Self::from_u8_vec(hex::decode(hex)?)
    }

    pub fn from_coinbase(
        input_script: Script,
        output_script: Script,
        output_amount: u64,
        block_num: u64,
    ) -> Self {
        let version = 1;
        let inputs = vec![TxInput::from_coinbase(input_script)];
        let outputs = vec![TxOutput::new(output_amount, output_script)];
        let lock_time = block_num;
        Self::new(version, inputs, outputs, lock_time)
    }

    pub fn is_coinbase(&self) -> bool {
        self.inputs.len() == 1 && self.inputs[0].is_coinbase()
    }

    pub fn blake3_hash(&self) -> [u8; 32] {
        blake3_hash(&self.to_u8_vec())
    }

    pub fn id(&self) -> [u8; 32] {
        double_blake3_hash(&self.to_u8_vec())
    }

    pub fn hash_prevouts(&self) -> Vec<u8> {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.input_tx_id);
            data.extend(&input.input_tx_out_num.to_be_bytes());
        }
        double_blake3_hash(&data).to_vec()
    }

    pub fn hash_sequence(&self) -> Vec<u8> {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.sequence.to_le_bytes());
        }
        double_blake3_hash(&data).to_vec()
    }

    pub fn hash_outputs(&self) -> Vec<u8> {
        let mut data = Vec::new();
        for output in &self.outputs {
            data.extend(&output.to_u8_vec());
        }
        double_blake3_hash(&data).to_vec()
    }

    pub fn sighash_preimage(
        &self,
        input_index: usize,
        script_u8_vec: Vec<u8>,
        amount: u64,
        hash_type: u8,
        hash_cache: &mut HashCache,
    ) -> Vec<u8> {
        const SIGHASH_ANYONECANPAY: u8 = 0x80;
        const SIGHASH_SINGLE: u8 = 0x03;
        const SIGHASH_NONE: u8 = 0x02;

        let mut prevouts_hash = vec![0; 32];
        let mut sequence_hash = vec![0; 32];
        let mut outputs_hash = vec![0; 32];

        if hash_type & SIGHASH_ANYONECANPAY == 0 {
            // prevouts_hash = self.hash_prevouts();
            if hash_cache.prevouts_hash.is_none() {
                let hash = self.hash_prevouts();
                hash_cache.prevouts_hash = Some(hash);
            }

            prevouts_hash = hash_cache.prevouts_hash.as_ref().unwrap().clone();
        }

        if hash_type & SIGHASH_ANYONECANPAY == 0
            && hash_type & 0x1f != SIGHASH_SINGLE
            && hash_type & 0x1f != SIGHASH_NONE
        {
            // sequence_hash = self.hash_sequence();
            if hash_cache.sequence_hash.is_none() {
                let hash = self.hash_sequence();
                hash_cache.sequence_hash = Some(hash);
            }

            sequence_hash = hash_cache.sequence_hash.as_ref().unwrap().clone();
        }

        if hash_type & 0x1f != SIGHASH_SINGLE && hash_type & 0x1f != SIGHASH_NONE {
            // outputs_hash = self.hash_outputs();
            if hash_cache.outputs_hash.is_none() {
                let hash = self.hash_outputs();
                hash_cache.outputs_hash = Some(hash);
            }

            outputs_hash = hash_cache.outputs_hash.as_ref().unwrap().clone();
        } else if hash_type & 0x1f == SIGHASH_SINGLE && input_index < self.outputs.len() {
            outputs_hash = double_blake3_hash(&self.outputs[input_index].to_u8_vec()).to_vec();
        }

        let mut bw = BufferWriter::new();
        bw.write_u8(self.version);
        bw.write_u8_vec(prevouts_hash);
        bw.write_u8_vec(sequence_hash);
        bw.write_u8_vec(self.inputs[input_index].input_tx_id.clone());
        bw.write_u32_be(self.inputs[input_index].input_tx_out_num);
        bw.write_var_int(script_u8_vec.len() as u64);
        bw.write_u8_vec(script_u8_vec);
        bw.write_u64_be(amount);
        bw.write_u32_be(self.inputs[input_index].sequence);
        bw.write_u8_vec(outputs_hash);
        bw.write_u64_be(self.lock_time);
        bw.write_u8(hash_type);
        bw.to_u8_vec()
    }

    pub fn sighash_no_cache(
        &mut self,
        input_index: usize,
        script_u8_vec: Vec<u8>,
        amount: u64,
        hash_type: u8,
    ) -> Vec<u8> {
        let mut hash_cache = HashCache {
            prevouts_hash: None,
            sequence_hash: None,
            outputs_hash: None,
        };
        let preimage = self.sighash_preimage(
            input_index,
            script_u8_vec,
            amount,
            hash_type,
            &mut hash_cache,
        );
        double_blake3_hash(&preimage).to_vec()
    }

    pub fn sighash_with_cache(
        &mut self,
        input_index: usize,
        script_u8_vec: Vec<u8>,
        amount: u64,
        hash_type: u8,
        hash_cache: &mut HashCache,
    ) -> Vec<u8> {
        let preimage =
            self.sighash_preimage(input_index, script_u8_vec, amount, hash_type, hash_cache);
        double_blake3_hash(&preimage).to_vec()
    }

    pub fn sign_no_cache(
        &mut self,
        input_index: usize,
        private_key: [u8; 32],
        script: Vec<u8>,
        amount: u64,
        hash_type: u8,
    ) -> TxSignature {
        let secp = Secp256k1::new();
        let message = Message::from_digest_slice(&self.sighash_no_cache(
            input_index,
            script,
            amount,
            hash_type,
        ))
        .expect("32 bytes");
        let key = secp256k1::SecretKey::from_slice(&private_key).expect("32 bytes");
        let sig = secp.sign_ecdsa(&message, &key);
        let sig = sig.serialize_compact();
        TxSignature::new(hash_type, sig.to_vec())
    }

    pub fn sign_with_cache(
        &mut self,
        input_index: usize,
        private_key: [u8; 32],
        script: Vec<u8>,
        amount: u64,
        hash_type: u8,
        hash_cache: &mut HashCache,
    ) -> TxSignature {
        let secp = Secp256k1::new();
        let message = Message::from_digest_slice(&self.sighash_with_cache(
            input_index,
            script,
            amount,
            hash_type,
            hash_cache,
        ))
        .expect("32 bytes");
        let key = secp256k1::SecretKey::from_slice(&private_key).expect("32 bytes");
        let sig = secp.sign_ecdsa(&message, &key);
        let sig = sig.serialize_compact();
        TxSignature::new(hash_type, sig.to_vec())
    }

    pub fn verify_no_cache(
        &mut self,
        input_index: usize,
        public_key: [u8; 33],
        signature: TxSignature,
        script: Vec<u8>,
        amount: u64,
    ) -> bool {
        let hash_type = signature.hash_type;
        let secp = Secp256k1::new();
        let pubkey = PublicKey::from_slice(&public_key).expect("33 bytes");
        let message = Message::from_digest_slice(&self.sighash_no_cache(
            input_index,
            script,
            amount,
            hash_type,
        ))
        .expect("32 bytes");
        let signature = Signature::from_compact(&signature.sig_buf).expect("64 bytes");
        secp.verify_ecdsa(&message, &signature, &pubkey).is_ok()
    }

    pub fn verify_with_cache(
        &mut self,
        input_index: usize,
        public_key: [u8; 33],
        signature: TxSignature,
        script: Vec<u8>,
        amount: u64,
        hash_cache: &mut HashCache,
    ) -> bool {
        let hash_type = signature.hash_type;
        let secp = Secp256k1::new();
        let pubkey = PublicKey::from_slice(&public_key).expect("33 bytes");
        let message = Message::from_digest_slice(&self.sighash_with_cache(
            input_index,
            script,
            amount,
            hash_type,
            hash_cache,
        ))
        .expect("32 bytes");
        let signature = Signature::from_compact(&signature.sig_buf).expect("64 bytes");
        secp.verify_ecdsa(&message, &signature, &pubkey).is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::priv_key::PrivKey;
    use crate::script::Script;

    #[test]
    fn test_tx() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);

        let buf = tx.to_u8_vec();
        let tx2 = Tx::from_u8_vec(buf).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_time, tx2.lock_time);
        Ok(())
    }

    #[test]
    fn test_from_buffer_reader() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);

        let buf = tx.to_u8_vec();
        let mut reader = BufferReader::new(buf);
        let tx2 = Tx::from_buffer_reader(&mut reader).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_time, tx2.lock_time);
        Ok(())
    }

    #[test]
    fn test_to_string_and_from_string() -> Result<(), String> {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);

        let hex = tx.to_string();
        let tx2 = Tx::from_string(&hex).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_time, tx2.lock_time);
        Ok(())
    }

    #[test]
    fn test_from_coinbase() {
        let input_script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_amount = 100;
        let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
        assert_eq!(tx.version, 1);
        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 1);
        assert_eq!(tx.lock_time, 0);
    }

    #[test]
    fn test_is_coinbase() {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);
        assert!(!tx.is_coinbase());

        let input_script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_amount = 100;
        let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
        assert!(tx.is_coinbase());
    }

    #[test]
    fn test_hash_once() {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);
        let expected_hash = blake3_hash(&tx.to_u8_vec());
        assert_eq!(tx.blake3_hash(), expected_hash);
    }

    #[test]
    fn test_hash() {
        let input_tx_id = vec![0; 32];
        let input_tx_index = 0;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let sequence = 0;
        let tx_input = TxInput::new(input_tx_id, input_tx_index, script, sequence);

        let value = 100;
        let script = Script::from_string("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOutput::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_time = 0;
        let tx = Tx::new(version, inputs, outputs, lock_time);
        let expected_hash = double_blake3_hash(&tx.to_u8_vec());
        assert_eq!(tx.id(), expected_hash);
    }

    #[test]
    fn hash_prevouts() {
        let version = 1;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TxOutput::new(100 as u64, Script::from_string("").unwrap())];

        let tx = Tx::new(version, inputs, outputs, 0 as u64);

        let result = tx.hash_prevouts();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn hash_sequence() {
        let version = 1;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TxOutput::new(100 as u64, Script::from_string("").unwrap())];

        let tx = Tx::new(version, inputs, outputs, 0 as u64);

        let result = tx.hash_sequence();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("5c9bc5bfc9fe60992fb5432ba6d5da1b5e232127b6a5678f93063b2d766cfbf5")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn hash_outputs() {
        let version = 1;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TxOutput::new(100 as u64, Script::from_string("").unwrap())];

        let tx = Tx::new(version, inputs, outputs, 0 as u64);

        let result = tx.hash_outputs();

        assert_eq!(result.len(), 32);

        let expected =
            hex::decode("8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5")
                .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_sighash() {
        let version = 1;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TxOutput::new(100 as u64, Script::from_string("").unwrap())];

        let mut tx = Tx::new(version, inputs, outputs, 0 as u64);

        let script = Script::from_string("").unwrap();
        let amount = 1;
        let hash_type = TxSignature::SIGHASH_ALL;
        let preimage = tx.sighash_no_cache(0, script.to_u8_vec(), amount, hash_type);

        let expected =
            hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad")
                .unwrap();
        assert_eq!(preimage, expected);
    }

    #[test]
    fn test_sighash_with_cache() {
        let version = 1;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        let outputs = vec![TxOutput::new(100 as u64, Script::from_string("").unwrap())];

        let mut tx = Tx::new(version, inputs, outputs, 0 as u64);

        let script = Script::from_string("").unwrap();
        let amount = 1;
        let hash_type = TxSignature::SIGHASH_ALL;
        let hash_cache = &mut HashCache::new();
        let preimage = tx.sighash_with_cache(0, script.to_u8_vec(), amount, hash_type, hash_cache);

        let expected =
            hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad")
                .unwrap();
        assert_eq!(preimage, expected);
    }

    #[test]
    fn sign_and_verify() {
        // Arrange
        let input_index = 0;
        let private_key =
            hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad")
                .unwrap();
        let script = vec![];
        let amount = 100;
        let hash_type = TxSignature::SIGHASH_ALL;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        assert_eq!(
            hex::encode(&inputs[0].to_u8_vec()),
            "00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff"
        );
        let outputs = vec![TxOutput::new(100, Script::from_string("").unwrap())];
        assert_eq!(hex::encode(&outputs[0].to_u8_vec()), "000000000000006400");
        let mut tx = Tx::new(1, inputs, outputs, 0);
        assert_eq!(hex::encode(&tx.to_u8_vec()), "010100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff010000000000000064000000000000000000");

        // Act
        let signature = tx.sign_no_cache(
            input_index,
            private_key.as_slice().try_into().unwrap(),
            script.clone(),
            amount,
            hash_type,
        );

        // Assert
        let expected_signature_hex = "0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3";
        assert_eq!(hex::encode(&signature.to_u8_vec()), expected_signature_hex);

        // Arrange
        // let key = KeyPair::new(private_key);
        // let public_key = key.public_key();

        let priv_key = PrivKey::from_u8_vec(private_key).unwrap();
        let pub_key_buf = priv_key.to_pub_key_buf().unwrap();

        // Act
        let result =
            tx.verify_no_cache(input_index, pub_key_buf, signature, script.clone(), amount);

        // Assert
        assert!(result);
    }

    #[test]
    fn sign_and_verify_with_cache() {
        // Arrange
        let input_index = 0;
        let private_key =
            hex::decode("7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad")
                .unwrap();
        let script = vec![];
        let amount = 100;
        let hash_type = TxSignature::SIGHASH_ALL;
        let inputs = vec![TxInput::new(
            vec![0; 32],
            0,
            Script::from_string("").unwrap(),
            0xffffffff,
        )];
        assert_eq!(
            hex::encode(&inputs[0].to_u8_vec()),
            "00000000000000000000000000000000000000000000000000000000000000000000000000ffffffff"
        );
        let outputs = vec![TxOutput::new(100, Script::from_string("").unwrap())];
        assert_eq!(hex::encode(&outputs[0].to_u8_vec()), "000000000000006400");
        let mut tx = Tx::new(1, inputs, outputs, 0);
        assert_eq!(hex::encode(&tx.to_u8_vec()), "010100000000000000000000000000000000000000000000000000000000000000000000000000ffffffff010000000000000064000000000000000000");
        let hash_cache_1 = &mut HashCache::new();

        // Act
        let signature = tx.sign_with_cache(
            input_index,
            private_key.as_slice().try_into().unwrap(),
            script.clone(),
            amount,
            hash_type,
            hash_cache_1,
        );

        // Assert
        let expected_signature_hex = "0176da08c70dd993c7d21f68e923f0f2585ca51a765b3a12f184176cc4277583bf544919a8c36ca9bd5d25d6b4b2a4ab6f303937725c134df86db82d78f627c7c3";
        assert_eq!(hex::encode(&signature.to_u8_vec()), expected_signature_hex);

        // Arrange
        // let key = KeyPair::new(private_key);
        // let public_key = key.public_key();
        let hash_cache_2 = &mut HashCache::new();
        let pub_key_buf = PrivKey::from_u8_vec(private_key)
            .unwrap()
            .to_pub_key_buf()
            .unwrap();

        // Act
        let result = tx.verify_with_cache(
            input_index,
            pub_key_buf,
            signature,
            script.clone(),
            amount,
            hash_cache_2,
        );

        // Assert
        assert!(result);
    }
}
