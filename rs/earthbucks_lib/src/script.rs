use crate::iso_buf_reader::IsoBufReader;
use crate::opcode::{Opcode, OP};
use crate::pub_key::PubKey;
use crate::script_chunk::ScriptChunk;
use crate::script_num::ScriptNum;
use crate::tx_signature::TxSignature;

#[derive(PartialEq, Debug, Clone)]
pub struct Script {
    pub chunks: Vec<ScriptChunk>,
}

impl Script {
    pub fn new(chunks: Vec<ScriptChunk>) -> Self {
        Self { chunks }
    }

    pub fn self_from_iso_str(&self, s: &str) -> Result<Self, Box<dyn std::error::Error>> {
        if s.is_empty() {
            return Ok(Self::new(Vec::new()));
        }
        let chunks: Result<Vec<ScriptChunk>, _> = s
            .split_whitespace()
            .map(|s| ScriptChunk::from_iso_str(s.to_string()))
            .collect();
        Ok(Self::new(chunks?))
    }

    pub fn from_iso_str(s: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // use from_iso_str
        let script = Self::new(Vec::new());
        script.self_from_iso_str(s)
    }

    pub fn to_iso_str(&self) -> Result<String, Box<dyn std::error::Error>> {
        let chunks: Result<Vec<String>, _> =
            self.chunks.iter().map(|chunk| chunk.to_iso_str()).collect();
        Ok(chunks?.join(" "))
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        for chunk in &self.chunks {
            buf.extend(chunk.to_iso_buf());
        }
        buf
    }

    pub fn from_iso_buf(arr: &[u8]) -> Result<Self, String> {
        let mut reader = IsoBufReader::new(arr.to_vec());
        Self::from_iso_buf_reader(&mut reader)
    }

    pub fn from_iso_buf_reader(reader: &mut IsoBufReader) -> Result<Self, String> {
        let mut script = Self::new(Vec::new());

        while !reader.eof() {
            let chunk = ScriptChunk::from_iso_buf_reader(reader)
                .map_err(|e| "script::from_iso_buf_reader: ".to_string() + &e)?;
            script.chunks.push(chunk);
        }
        Result::Ok(script)
    }

    pub fn from_multi_sig_output(m: u8, pub_keys: Vec<Vec<u8>>) -> Self {
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::from_small_number(m as i8));
        for pub_key in pub_keys.clone() {
            script.chunks.push(ScriptChunk::from_data(pub_key));
        }
        script
            .chunks
            .push(ScriptChunk::from_small_number(pub_keys.len() as i8));
        script
            .chunks
            .push(ScriptChunk::new(OP["CHECKMULTISIG"], None));
        script
    }

    pub fn from_multi_sig_input(sigs: Vec<Vec<u8>>) -> Self {
        let mut script = Self::new(Vec::new());
        for sig in sigs {
            script.chunks.push(ScriptChunk::from_data(sig));
        }
        script
    }

    pub fn from_pkh_output(pkh: &[u8; 32]) -> Self {
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_DUP, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None));
        script.chunks.push(ScriptChunk::from_data(pkh.to_vec()));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_EQUALVERIFY, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKSIG, None));
        script
    }

    pub fn is_pkh_output(&self) -> bool {
        self.chunks.len() == 5
            && self.chunks[0].opcode == Opcode::OP_DUP
            && self.chunks[1].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[2].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[2].buffer.is_some()
            && self.chunks[2].buffer.as_ref().unwrap().len() == 32
            && self.chunks[3].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[4].opcode == Opcode::OP_CHECKSIG
    }

    pub fn from_pkh_input(signature: &[u8], pub_key: &[u8]) -> Self {
        let mut script = Self::new(Vec::new());
        script
            .chunks
            .push(ScriptChunk::from_data(signature.to_vec()));
        script.chunks.push(ScriptChunk::from_data(pub_key.to_vec()));
        script
    }

    pub fn is_pkh_input(&self) -> bool {
        self.chunks.len() == 2
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
    }

    pub fn from_pkh_input_placeholder() -> Self {
        let sig_buf = vec![0; TxSignature::SIZE];
        let pub_key = vec![0; PubKey::SIZE];
        Self::from_pkh_input(&sig_buf, &pub_key)
    }

    // PKH1YX = PubKey Hash with 1 Year Expiry
    // 52416 blocks = 2016 blocks / 2 * 52
    pub fn from_pkh1yx_output(pkh: &[u8; 32]) -> Self {
        let lock_rel: u32 = 52416;
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_IF, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DUP, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None));
        script.chunks.push(ScriptChunk::from_data(pkh.to_vec()));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_EQUALVERIFY, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKSIG, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ELSE, None));
        script.chunks.push(ScriptChunk::from_data(
            ScriptNum::from_u32(lock_rel).to_iso_buf(),
        ));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DROP, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_1, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ENDIF, None));
        script
    }

    pub fn is_pkh1yx_output(&self) -> bool {
        let lock_rel: u32 = 52416;
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[7].buffer.is_some()
            && self.chunks[7].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[7].buffer.as_ref().unwrap()[0],
                self.chunks[7].buffer.as_ref().unwrap()[1],
            ]) == lock_rel as u16
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    // PKH3MX = PubKey Hash with 3 Month Expiry
    // 13104 blocks = 2016 blocks / 2 * 52 / 12 * 3
    pub fn from_pkh3mx_output(pkh: &[u8; 32]) -> Self {
        let lock_rel: u32 = 13104;
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_IF, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DUP, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None));
        script.chunks.push(ScriptChunk::from_data(pkh.to_vec()));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_EQUALVERIFY, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKSIG, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ELSE, None));
        script.chunks.push(ScriptChunk::from_data(
            ScriptNum::from_u32(lock_rel).to_iso_buf(),
        ));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DROP, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_1, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ENDIF, None));
        script
    }

    pub fn is_pkh3mx_output(&self) -> bool {
        let lock_rel: u32 = 13104;
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[7].buffer.is_some()
            && self.chunks[7].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[7].buffer.as_ref().unwrap()[0],
                self.chunks[7].buffer.as_ref().unwrap()[1],
            ]) == lock_rel as u16
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    // PKH2WX = PubKey Hash with 2 Week Expiry
    // 2016 blocks = two week block adjustment interval for 10 min blocks
    pub fn from_pkh2wx_output(pkh: &[u8; 32]) -> Self {
        let lock_rel: u32 = 2016;
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_IF, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DUP, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None));
        script.chunks.push(ScriptChunk::from_data(pkh.to_vec()));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_EQUALVERIFY, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKSIG, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ELSE, None));
        script.chunks.push(ScriptChunk::from_data(
            ScriptNum::from_u32(lock_rel).to_iso_buf(),
        ));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DROP, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_1, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ENDIF, None));
        script
    }

    pub fn is_pkh2wx_output(&self) -> bool {
        let lock_rel: u32 = 2016;
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[7].buffer.is_some()
            && self.chunks[7].buffer.as_ref().unwrap().len() == 2
            && u16::from_be_bytes([
                self.chunks[7].buffer.as_ref().unwrap()[0],
                self.chunks[7].buffer.as_ref().unwrap()[1],
            ]) == lock_rel as u16
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    // PKH1HX = PubKey Hash with 1 Hour Expiry
    // 6 blocks = 1 hour for 10 min blocks
    pub fn from_pkh1hx_output(pkh: &[u8; 32]) -> Self {
        let lock_rel: u32 = 6;
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_IF, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DUP, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_DOUBLEBLAKE3, None));
        script.chunks.push(ScriptChunk::from_data(pkh.to_vec()));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_EQUALVERIFY, None));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKSIG, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ELSE, None));
        script
            .chunks
            .push(ScriptChunk::from_small_number(lock_rel as i8));
        script
            .chunks
            .push(ScriptChunk::new(Opcode::OP_CHECKLOCKRELVERIFY, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_DROP, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_1, None));
        script.chunks.push(ScriptChunk::new(Opcode::OP_ENDIF, None));
        script
    }

    pub fn is_pkh1hx_output(&self) -> bool {
        let lock_rel: u32 = 6;
        self.chunks.len() == 12
            && self.chunks[0].opcode == Opcode::OP_IF
            && self.chunks[1].opcode == Opcode::OP_DUP
            && self.chunks[2].opcode == Opcode::OP_DOUBLEBLAKE3
            && self.chunks[3].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[3].buffer.is_some()
            && self.chunks[3].buffer.as_ref().unwrap().len() == 32
            && self.chunks[4].opcode == Opcode::OP_EQUALVERIFY
            && self.chunks[5].opcode == Opcode::OP_CHECKSIG
            && self.chunks[6].opcode == Opcode::OP_ELSE
            && self.chunks[7].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[7].buffer.is_some()
            && self.chunks[7].buffer.as_ref().unwrap().len() == 1
            && self.chunks[7].buffer.as_ref().unwrap()[0] == lock_rel as u8
            && self.chunks[8].opcode == Opcode::OP_CHECKLOCKRELVERIFY
            && self.chunks[9].opcode == Opcode::OP_DROP
            && self.chunks[10].opcode == Opcode::OP_1
            && self.chunks[11].opcode == Opcode::OP_ENDIF
    }

    pub fn from_expired_input() -> Self {
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::new(Opcode::OP_0, None));
        script
    }

    pub fn is_expired_input(&self) -> bool {
        self.chunks.len() == 1 && self.chunks[0].opcode == Opcode::OP_0
    }

    pub fn from_unexpired_pkh_input(
        sig_buf: &[u8; TxSignature::SIZE],
        pub_key_buf: &[u8; PubKey::SIZE],
    ) -> Self {
        let mut script = Self::new(Vec::new());
        script.chunks.push(ScriptChunk::from_data(sig_buf.to_vec()));
        script
            .chunks
            .push(ScriptChunk::from_data(pub_key_buf.to_vec()));
        script.chunks.push(ScriptChunk::new(Opcode::OP_1, None));
        script
    }

    pub fn is_unexpired_pkh_input(&self) -> bool {
        self.chunks.len() == 3
            && self.chunks[0].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[0].buffer.is_some()
            && self.chunks[0].buffer.as_ref().unwrap().len() == TxSignature::SIZE
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == PubKey::SIZE
            && self.chunks[2].opcode == Opcode::OP_1
    }

    pub fn is_push_only(&self) -> bool {
        for chunk in &self.chunks {
            if chunk.opcode > Opcode::OP_16 {
                return false;
            }
        }
        true
    }

    pub fn is_coinbase_input(&self) -> bool {
        // TODO: Add more checks
        self.is_push_only()
    }

    pub fn is_standard_input(&self) -> bool {
        self.is_push_only() && (self.is_unexpired_pkh_input() || self.is_expired_input())
    }

    pub fn is_standard_output(&self) -> bool {
        self.is_pkh3mx_output() || self.is_pkh1hx_output()
    }
}

#[cfg(test)]
mod tests {
    use serde::Deserialize;

    use super::*;
    use crate::script_chunk::ScriptChunk;

    #[test]
    fn test_new() {
        let chunks = vec![ScriptChunk::new(1, Some(vec![0x01, 0x02, 0x03]))];
        let script = Script::new(chunks.clone());
        assert_eq!(script.chunks, chunks);
    }

    #[test]
    fn test_from_iso_str() {
        let s = "DUP BLAKE3 DOUBLEBLAKE3";
        let script = Script::from_iso_str(s).unwrap();
        let expected_chunks = vec![
            ScriptChunk::from_iso_str("DUP".to_string()).unwrap(),
            ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
        ];
        assert_eq!(script.chunks, expected_chunks);
    }

    #[test]
    fn test_to_string() {
        let chunks = vec![
            ScriptChunk::from_iso_str("DUP".to_string()).unwrap(),
            ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
        ];
        let script = Script::new(chunks);
        let expected_string = "DUP BLAKE3 DOUBLEBLAKE3"; // Replace with the expected string representation of your chunks
        assert_eq!(script.to_iso_str().unwrap(), expected_string);
    }

    #[test]
    fn test_to_iso_buf() {
        let chunks = vec![
            ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
            ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
        ];
        let script = Script::new(chunks);
        let expected_vec = vec![76, 0x02, 0xff, 0xff, 166, 167];
        assert_eq!(script.to_iso_buf(), expected_vec);
    }

    #[test]
    fn test_from_iso_buf() {
        let arr = vec![76, 0x02, 0xff, 0xff, 166, 167];
        let script = Script::from_iso_buf(&arr);
        let expected_chunks = vec![
            ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
            ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
        ];
        assert_eq!(script.unwrap().chunks, expected_chunks);
    }

    #[test]
    fn test_from_iso_buf_2() {
        let input_string = "0xffff 0xffff";
        let expected_output_string = "0xffff 0xffff";

        // Convert the input string to a Script
        let script = Script::from_iso_str(input_string).unwrap();

        // Convert the Script to a u8 vector
        let iso_buf = script.to_iso_buf();

        let script2 = Script::from_iso_buf(&iso_buf).unwrap();

        // Convert the Script back to a string
        let output_string = script2.to_iso_str().unwrap();

        // Check that the output string is the same as the input string
        assert_eq!(output_string, expected_output_string);
    }

    #[test]
    fn test_from_iso_buf_new() {
        let arr = vec![76, 0x02, 0xff, 0xff, 166, 167];
        let script = Script::from_iso_buf(arr.as_slice());
        let expected_chunks = vec![
            ScriptChunk::from_iso_str("0xffff".to_string()).unwrap(),
            ScriptChunk::from_iso_str("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_iso_str("DOUBLEBLAKE3".to_string()).unwrap(),
        ];
        let new_script = Script::new(expected_chunks);
        let new_string = new_script.to_iso_str().unwrap();
        assert_eq!(script.unwrap().to_iso_str().unwrap(), new_string);
    }

    #[test]
    fn test_is_pkh_output() {
        let mut script = Script::from_iso_str("").unwrap();
        script.chunks = vec![
            ScriptChunk::new(OP["DUP"], None),
            ScriptChunk::new(OP["DOUBLEBLAKE3"], None),
            ScriptChunk::new(OP["PUSHDATA1"], Some(vec![0; 32])),
            ScriptChunk::new(OP["EQUALVERIFY"], None),
            ScriptChunk::new(OP["CHECKSIG"], None),
        ];

        assert!(script.is_pkh_output());

        // Change a chunk to make the script invalid
        script.chunks[0].opcode = OP["BLAKE3"];
        assert!(!script.is_pkh_output());
    }

    // standard test vectors

    #[derive(Deserialize)]
    struct TestVectorScript {
        from_iso_buf: TestVectorErrors,
    }

    #[derive(Deserialize)]
    struct TestVectorErrors {
        errors: Vec<TestVectorError>,
    }

    #[derive(Deserialize)]
    struct TestVectorError {
        hex: String,
        error: String,
    }

    #[test]
    fn test_vectors_from_iso_buf() {
        let file = std::fs::File::open("../../json/script.json").unwrap();
        let test_vectors: TestVectorScript = serde_json::from_reader(file).unwrap();

        for test_vector in test_vectors.from_iso_buf.errors {
            let arr = hex::decode(test_vector.hex).unwrap();
            let result = Script::from_iso_buf(&arr);
            match result {
                Ok(_) => panic!("Expected an error, but got Ok(_)"),
                Err(e) => assert!(e.to_string().starts_with(&test_vector.error)),
            }
        }
    }
}
