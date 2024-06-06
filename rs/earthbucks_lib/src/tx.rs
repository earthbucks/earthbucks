use crate::buf::EbxBuf;
use crate::buf_reader::BufReader;
use crate::buf_writer::BufWriter;
use crate::error::EbxError;
use crate::hash::blake3_hash;
use crate::hash::double_blake3_hash;
use crate::pub_key::PubKey;
use crate::script::Script;
use crate::tx_in::TxIn;
use crate::tx_out::TxOut;
use crate::tx_signature::TxSignature;
use crate::var_int::VarInt;
use secp256k1::ecdsa::Signature;
use secp256k1::{Message, PublicKey, Secp256k1};

#[derive(Debug, Default)]
pub struct HashCache {
    pub prevouts_hash: Option<[u8; 32]>,
    pub lock_rel_hash: Option<[u8; 32]>,
    pub outputs_hash: Option<[u8; 32]>,
}

impl HashCache {
    pub fn new() -> Self {
        Self {
            prevouts_hash: None,
            lock_rel_hash: None,
            outputs_hash: None,
        }
    }
}

// add clone support
#[derive(Clone, Debug)]
pub struct Tx {
    pub version: u8,
    pub inputs: Vec<TxIn>,
    pub outputs: Vec<TxOut>,
    pub lock_abs: u32,
}

impl Tx {
    pub fn new(version: u8, inputs: Vec<TxIn>, outputs: Vec<TxOut>, lock_abs: u32) -> Self {
        Self {
            version,
            inputs,
            outputs,
            lock_abs,
        }
    }

    pub fn from_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut reader = BufReader::new(buf);
        Self::from_buf_reader(&mut reader)
    }

    pub fn to_buf(&self) -> Vec<u8> {
        self.to_buffer_writer().to_buf()
    }

    pub fn from_buf_reader(reader: &mut BufReader) -> Result<Self, EbxError> {
        let version = reader.read_u8()?;
        let input_count = reader.read_var_int()? as usize;
        let mut inputs = Vec::new();
        for _ in 0..input_count {
            inputs.push(TxIn::from_buf_reader(reader)?);
        }
        let output_count = reader.read_var_int()? as usize;
        let mut outputs = Vec::new();
        for _ in 0..output_count {
            outputs.push(TxOut::from_buf_reader(reader)?);
        }
        let lock_num = reader.read_u32_be()?;
        Ok(Self::new(version, inputs, outputs, lock_num))
    }

    pub fn to_buffer_writer(&self) -> BufWriter {
        let mut writer = BufWriter::new();
        writer.write_u8(self.version);
        writer.write(VarInt::from_u64(self.inputs.len() as u64).to_buf());
        for input in &self.inputs {
            writer.write(input.to_buf());
        }
        writer.write(VarInt::from_u64(self.outputs.len() as u64).to_buf());
        for output in &self.outputs {
            writer.write(output.to_buf());
        }
        writer.write_u32_be(self.lock_abs);
        writer
    }

    pub fn to_strict_hex(&self) -> String {
        hex::encode(self.to_buf())
    }

    pub fn from_strict_hex(hex: &str) -> Result<Self, EbxError> {
        Self::from_buf(Vec::<u8>::from_strict_hex(hex)?)
    }

    pub fn to_strict_str(&self) -> String {
        hex::encode(self.to_buf())
    }

    pub fn from_strict_str(hex: &str) -> Result<Self, EbxError> {
        Self::from_strict_hex(hex)
    }

    pub fn from_coinbase(
        input_script: Script,
        output_script: Script,
        output_amount: u64,
        block_num: u32,
    ) -> Self {
        let version = 1;
        let inputs = vec![TxIn::from_coinbase(input_script)];
        let outputs = vec![TxOut::new(output_amount, output_script)];
        let lock_num = block_num;
        Self::new(version, inputs, outputs, lock_num)
    }

    pub fn is_coinbase(&self) -> bool {
        self.inputs.len() == 1 && self.inputs[0].is_coinbase()
    }

    pub fn blake3_hash(&self) -> [u8; 32] {
        blake3_hash(&self.to_buf())
    }

    pub fn id(&self) -> [u8; 32] {
        double_blake3_hash(&self.to_buf())
    }

    pub fn hash_prevouts(&self) -> [u8; 32] {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.input_tx_id);
            data.extend(&input.input_tx_out_num.to_be_bytes());
        }
        double_blake3_hash(&data)
    }

    pub fn hash_lock_rel(&self) -> [u8; 32] {
        let mut data = Vec::new();
        for input in &self.inputs {
            data.extend(&input.lock_rel.to_be_bytes());
        }
        double_blake3_hash(&data)
    }

    pub fn hash_outputs(&self) -> [u8; 32] {
        let mut data = Vec::new();
        for output in &self.outputs {
            data.extend(&output.to_buf());
        }
        double_blake3_hash(&data)
    }

    pub fn sighash_preimage(
        &self,
        input_index: usize,
        script_iso_buf: Vec<u8>,
        amount: u64,
        hash_type: u8,
        hash_cache: &mut HashCache,
    ) -> Vec<u8> {
        const SIGHASH_ANYONECANPAY: u8 = 0x80;
        const SIGHASH_SINGLE: u8 = 0x03;
        const SIGHASH_NONE: u8 = 0x02;

        let mut prevouts_hash = [0; 32];
        let mut lock_rel_hash = [0; 32];
        let mut outputs_hash = [0; 32];

        if hash_type & SIGHASH_ANYONECANPAY == 0 {
            // prevouts_hash = self.hash_prevouts();
            if hash_cache.prevouts_hash.is_none() {
                let hash = self.hash_prevouts();
                hash_cache.prevouts_hash = Some(hash);
            }

            prevouts_hash = hash_cache.prevouts_hash.unwrap();
        }

        if hash_type & SIGHASH_ANYONECANPAY == 0
            && hash_type & 0x1f != SIGHASH_SINGLE
            && hash_type & 0x1f != SIGHASH_NONE
        {
            // lock_rel_hash = self.hash_lock_rel();
            if hash_cache.lock_rel_hash.is_none() {
                let hash = self.hash_lock_rel();
                hash_cache.lock_rel_hash = Some(hash);
            }

            lock_rel_hash = hash_cache.lock_rel_hash.unwrap();
        }

        if hash_type & 0x1f != SIGHASH_SINGLE && hash_type & 0x1f != SIGHASH_NONE {
            // outputs_hash = self.hash_outputs();
            if hash_cache.outputs_hash.is_none() {
                let hash = self.hash_outputs();
                hash_cache.outputs_hash = Some(hash);
            }

            outputs_hash = hash_cache.outputs_hash.unwrap();
        } else if hash_type & 0x1f == SIGHASH_SINGLE && input_index < self.outputs.len() {
            outputs_hash = double_blake3_hash(&self.outputs[input_index].to_buf());
        }

        let mut bw = BufWriter::new();
        bw.write_u8(self.version);
        bw.write(prevouts_hash.to_vec());
        bw.write(lock_rel_hash.to_vec());
        bw.write(self.inputs[input_index].input_tx_id.clone().to_vec());
        bw.write_u32_be(self.inputs[input_index].input_tx_out_num);
        bw.write_var_int(script_iso_buf.len() as u64);
        bw.write(script_iso_buf);
        bw.write_u64_be(amount);
        bw.write_u32_be(self.inputs[input_index].lock_rel);
        bw.write(outputs_hash.to_vec());
        bw.write_u32_be(self.lock_abs);
        bw.write_u8(hash_type);
        bw.to_buf()
    }

    pub fn sighash_no_cache(
        &mut self,
        input_index: usize,
        script_iso_buf: Vec<u8>,
        amount: u64,
        hash_type: u8,
    ) -> [u8; 32] {
        let mut hash_cache = HashCache {
            prevouts_hash: None,
            lock_rel_hash: None,
            outputs_hash: None,
        };
        let preimage = self.sighash_preimage(
            input_index,
            script_iso_buf,
            amount,
            hash_type,
            &mut hash_cache,
        );
        double_blake3_hash(&preimage)
    }

    pub fn sighash_with_cache(
        &mut self,
        input_index: usize,
        script_iso_buf: Vec<u8>,
        amount: u64,
        hash_type: u8,
        hash_cache: &mut HashCache,
    ) -> [u8; 32] {
        let preimage =
            self.sighash_preimage(input_index, script_iso_buf, amount, hash_type, hash_cache);
        double_blake3_hash(&preimage)
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
        TxSignature::new(hash_type, sig)
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
        TxSignature::new(hash_type, sig)
    }

    pub fn verify_no_cache(
        &mut self,
        input_index: usize,
        public_key: [u8; PubKey::SIZE],
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
        public_key: [u8; PubKey::SIZE],
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
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);

        let buf = tx.to_buf();
        let tx2 = Tx::from_buf(buf).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_abs, tx2.lock_abs);
        Ok(())
    }

    #[test]
    fn test_from_buf_reader() -> Result<(), String> {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);

        let buf = tx.to_buf();
        let mut reader = BufReader::new(buf);
        let tx2 = Tx::from_buf_reader(&mut reader).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_abs, tx2.lock_abs);
        Ok(())
    }

    #[test]
    fn test_to_string_and_from_strict_str() -> Result<(), String> {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);

        let hex = tx.to_strict_str();
        let tx2 = Tx::from_strict_str(&hex).unwrap();
        assert_eq!(tx.version, tx2.version);
        assert_eq!(tx.inputs.len(), tx2.inputs.len());
        assert_eq!(tx.outputs.len(), tx2.outputs.len());
        assert_eq!(tx.lock_abs, tx2.lock_abs);
        Ok(())
    }

    #[test]
    fn test_from_coinbase() {
        let input_script =
            Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_script =
            Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_amount = 100;
        let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
        assert_eq!(tx.version, 1);
        assert_eq!(tx.inputs.len(), 1);
        assert_eq!(tx.outputs.len(), 1);
        assert_eq!(tx.lock_abs, 0);
    }

    #[test]
    fn test_is_coinbase() {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);
        assert!(!tx.is_coinbase());

        let input_script =
            Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_script =
            Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let output_amount = 100;
        let tx = Tx::from_coinbase(input_script, output_script, output_amount, 0);
        assert!(tx.is_coinbase());
    }

    #[test]
    fn test_hash_once() {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);
        let expected_hash = blake3_hash(&tx.to_buf());
        assert_eq!(tx.blake3_hash(), expected_hash);
    }

    #[test]
    fn test_hash() {
        let input_tx_id = [0; 32];
        let input_tx_index = 0;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let lock_rel = 0;
        let tx_input = TxIn::new(input_tx_id, input_tx_index, script, lock_rel);

        let value = 100;
        let script = Script::from_strict_str("DOUBLEBLAKE3 BLAKE3 DOUBLEBLAKE3 EQUAL").unwrap();
        let tx_output = TxOut::new(value, script);

        let version = 1;
        let inputs = vec![tx_input];
        let outputs = vec![tx_output];
        let lock_num = 0;
        let tx = Tx::new(version, inputs, outputs, lock_num);
        let expected_hash = double_blake3_hash(&tx.to_buf());
        assert_eq!(tx.id(), expected_hash);
    }

    #[test]
    fn test_hash_prevouts() {
        let version = 1;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        let outputs = vec![TxOut::new(100, Script::from_empty())];

        let tx = Tx::new(version, inputs, outputs, 0);

        let result = tx.hash_prevouts();

        assert_eq!(result.len(), 32);

        let expected = <[u8; 32]>::from_strict_hex(
            "2cb9ad7c6db72bb07dae3873c8a28903510eb87fae097338bc058612af388fba",
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_hash_lock_rel() {
        let version = 1;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        let outputs = vec![TxOut::new(100, Script::from_empty())];

        let tx = Tx::new(version, inputs, outputs, 0);

        let result = tx.hash_lock_rel();

        assert_eq!(result.len(), 32);

        let expected = <[u8; 32]>::from_strict_hex(
            "406986f514581cacbf3ab0fc3863b336d137af79318ce4bae553a91435773931",
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_hash_outputs() {
        let version = 1;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        let outputs = vec![TxOut::new(100, Script::from_empty())];

        let tx = Tx::new(version, inputs, outputs, 0);

        let result = tx.hash_outputs();

        assert_eq!(result.len(), 32);

        let expected = <[u8; 32]>::from_strict_hex(
            "8c92e84e8b3b8b44690cbf64547018defaf43ade3b793ed8aa8ad33ae33941e5",
        )
        .unwrap();
        assert_eq!(result, expected);
    }

    #[test]
    fn test_sighash() {
        let version = 1;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        let outputs = vec![TxOut::new(100, Script::from_empty())];

        let mut tx = Tx::new(version, inputs, outputs, 0);

        let script = Script::from_empty();
        let amount = 1;
        let hash_type = TxSignature::SIGHASH_ALL;
        let sighash = tx
            .sighash_no_cache(0, script.to_buf(), amount, hash_type)
            .to_strict_hex();

        let expected = "2c45591d9f58f6f8b464a429cfefae28b06684bd34c5ffa95cb1ce3551e3dfbf";

        assert_eq!(sighash, expected);
    }

    #[test]
    fn test_sighash_with_cache() {
        let version = 1;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        let outputs = vec![TxOut::new(100, Script::from_empty())];

        let mut tx = Tx::new(version, inputs, outputs, 0);

        let script = Script::from_empty();
        let amount = 1;
        let hash_type = TxSignature::SIGHASH_ALL;
        let hash_cache = &mut HashCache::new();
        let sighash = tx
            .sighash_with_cache(0, script.to_buf(), amount, hash_type, hash_cache)
            .to_strict_hex();

        let expected = "2c45591d9f58f6f8b464a429cfefae28b06684bd34c5ffa95cb1ce3551e3dfbf";
        assert_eq!(sighash, expected);
    }

    #[test]
    fn test_sign_and_verify() {
        let input_index = 0;
        let private_key = Vec::<u8>::from_strict_hex(
            "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
        )
        .unwrap();
        let script = vec![];
        let amount = 100;
        let hash_type = TxSignature::SIGHASH_ALL;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        assert_eq!(
            hex::encode(inputs[0].to_buf()),
            "0000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );
        let outputs = vec![TxOut::new(100, Script::from_empty())];
        assert_eq!(hex::encode(outputs[0].to_buf()), "000000000000006400");
        let mut tx = Tx::new(0, inputs, outputs, 0);
        assert_eq!(hex::encode(tx.to_buf()), "000100000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000640000000000");

        let signature = tx.sign_no_cache(
            input_index,
            private_key.as_slice().try_into().unwrap(),
            script.clone(),
            amount,
            hash_type,
        );

        let expected_signature_hex = "0158aa9faf524e08988f2fc4a5fb1a4d3ddda8a8ec58d6c06bbbd0b26bda5bbba8001d0057bb20352ece3248d697fe832555f762c533b76fc5a382e04d95774a5e";
        assert_eq!(hex::encode(signature.to_buf()), expected_signature_hex);

        let priv_key = PrivKey::from_buf(private_key).unwrap();
        let pub_key_buf = priv_key.to_pub_key_buffer().unwrap();

        let result =
            tx.verify_no_cache(input_index, pub_key_buf, signature, script.clone(), amount);

        assert!(result);
    }

    #[test]
    fn test_sign_and_verify_with_cache() {
        let input_index = 0;
        let private_key = Vec::<u8>::from_strict_hex(
            "7ca2df5597b60403be38cdbd4dc4cd89d7d00fce6b0773ef903bc8b87c377fad",
        )
        .unwrap();
        let script = vec![];
        let amount = 100;
        let hash_type = TxSignature::SIGHASH_ALL;
        let inputs = vec![TxIn::new([0; 32], 0, Script::from_empty(), 0)];
        assert_eq!(
            hex::encode(inputs[0].to_buf()),
            "0000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );
        let outputs = vec![TxOut::new(100, Script::from_empty())];
        assert_eq!(hex::encode(outputs[0].to_buf()), "000000000000006400");
        let mut tx = Tx::new(0, inputs, outputs, 0);
        assert_eq!(hex::encode(tx.to_buf()), "000100000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000640000000000");
        let hash_cache_1 = &mut HashCache::new();

        let signature = tx.sign_with_cache(
            input_index,
            private_key.as_slice().try_into().unwrap(),
            script.clone(),
            amount,
            hash_type,
            hash_cache_1,
        );

        let expected_signature_hex = "0158aa9faf524e08988f2fc4a5fb1a4d3ddda8a8ec58d6c06bbbd0b26bda5bbba8001d0057bb20352ece3248d697fe832555f762c533b76fc5a382e04d95774a5e";
        assert_eq!(hex::encode(signature.to_buf()), expected_signature_hex);

        let hash_cache_2 = &mut HashCache::new();
        let pub_key_buf = PrivKey::from_buf(private_key)
            .unwrap()
            .to_pub_key_buffer()
            .unwrap();

        let result = tx.verify_with_cache(
            input_index,
            pub_key_buf,
            signature,
            script.clone(),
            amount,
            hash_cache_2,
        );

        assert!(result);
    }
}
