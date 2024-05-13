use crate::iso_buf_reader::IsoBufReader;
use crate::opcode::{Opcode, OP};
use crate::script_chunk::ScriptChunk;

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
            let mut chunk = ScriptChunk::new(reader.read_u8()?, None);

            if chunk.opcode == Opcode::OP_PUSHDATA1
                || chunk.opcode == Opcode::OP_PUSHDATA2
                || chunk.opcode == Opcode::OP_PUSHDATA4
            {
                let len = match chunk.opcode {
                    opcode if opcode == Opcode::OP_PUSHDATA1 => reader.read_u8()? as u32,
                    opcode if opcode == Opcode::OP_PUSHDATA2 => reader.read_u16_be()? as u32,
                    opcode if opcode == Opcode::OP_PUSHDATA4 => reader.read_u32_be()?,
                    _ => unreachable!(),
                };

                chunk.buffer = Some(reader.read(len as usize)?.to_vec());

                let buffer_length = match &chunk.buffer {
                    Some(buffer) => buffer.len(),
                    None => 0, // or handle this case differently if you prefer
                };

                if buffer_length != len as usize {
                    return Err("invalid buffer length".to_string());
                }
            }

            script.chunks.push(chunk);
        }
        Result::Ok(script)
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
            && self.chunks[0].buffer.as_ref().unwrap().len() == 65
            && self.chunks[1].opcode == Opcode::OP_PUSHDATA1
            && self.chunks[1].buffer.is_some()
            && self.chunks[1].buffer.as_ref().unwrap().len() == 33
    }

    pub fn from_pkh_input_placeholder() -> Self {
        // 65 bytes for the signature and 33 bytes for the public key, all zeroes
        let signature = vec![0; 65];
        let pub_key = vec![0; 33];
        Self::from_pkh_input(&signature, &pub_key)
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

    pub fn is_push_only(&self) -> bool {
        for chunk in &self.chunks {
            if chunk.opcode > OP["PUSHDATA4"] {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod tests {
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
}
