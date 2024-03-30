use crate::buffer_reader::BufferReader;
use crate::opcode::NAME_TO_OPCODE;
use crate::script_chunk::ScriptChunk;

#[derive(Clone)]
pub struct Script {
    chunks: Vec<ScriptChunk>,
}

impl Script {
    pub fn new(chunks: Vec<ScriptChunk>) -> Self {
        Self { chunks }
    }

    pub fn from_string(&self, s: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let chunks: Result<Vec<ScriptChunk>, _> = s
            .split_whitespace()
            .map(|s| ScriptChunk::from_string_new(s.to_string()))
            .collect();
        Ok(Self::new(chunks?))
    }

    pub fn from_string_new(s: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // use from_string
        let script = Self::new(Vec::new());
        script.from_string(s)
    }

    pub fn to_string(&self) -> Result<String, Box<dyn std::error::Error>> {
        let chunks: Result<Vec<String>, _> =
            self.chunks.iter().map(|chunk| chunk.to_string()).collect();
        Ok(chunks?.join(" "))
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut buf = Vec::new();
        for chunk in &self.chunks {
            buf.extend(chunk.to_u8_vec());
        }
        buf
    }

    pub fn from_u8_vec(&mut self, arr: &[u8]) -> Result<(), Box<dyn std::error::Error>> {
        let mut reader = BufferReader::new(arr.to_vec());

        while !reader.eof() {
            let mut chunk = ScriptChunk::new(reader.read_u8(), None);

            if chunk.opcode == NAME_TO_OPCODE["PUSHDATA1"]
                || chunk.opcode == NAME_TO_OPCODE["PUSHDATA2"]
                || chunk.opcode == NAME_TO_OPCODE["PUSHDATA4"]
            {
                let len = match chunk.opcode {
                    opcode if opcode == NAME_TO_OPCODE["PUSHDATA1"] => reader.read_u8() as u32,
                    opcode if opcode == NAME_TO_OPCODE["PUSHDATA2"] => reader.read_u16_be() as u32,
                    opcode if opcode == NAME_TO_OPCODE["PUSHDATA4"] => reader.read_u32_be() as u32,
                    _ => unreachable!(),
                };

                chunk.buffer = Some(reader.read(len as usize).to_vec());

                let buffer_length = match &chunk.buffer {
                    Some(buffer) => buffer.len(),
                    None => 0, // or handle this case differently if you prefer
                };

                if buffer_length != len as usize {
                    return Err(From::from("invalid buffer length"));
                }
            }

            self.chunks.push(chunk);
        }

        Ok(())
    }

    pub fn from_u8_vec_new(arr: &[u8]) -> Result<Self, Box<dyn std::error::Error>> {
        let mut script = Self::new(Vec::new());
        script.from_u8_vec(arr)?;
        Result::Ok(script)
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
    fn test_from_string() {
        let s = "DUP BLAKE3 HASH160";
        let script = Script::from_string_new(s).unwrap();
        let expected_chunks = vec![
            ScriptChunk::from_string_new("DUP".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        assert_eq!(script.chunks, expected_chunks);
    }

    #[test]
    fn test_to_string() {
        let chunks = vec![
            ScriptChunk::from_string_new("DUP".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        let script = Script::new(chunks);
        let expected_string = "DUP BLAKE3 HASH160"; // Replace with the expected string representation of your chunks
        assert_eq!(script.to_string().unwrap(), expected_string);
    }

    #[test]
    fn test_to_u8_vec() {
        let chunks = vec![
            ScriptChunk::from_string_new("0xffff".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        let script = Script::new(chunks);
        let expected_vec = vec![76, 0x02, 0xff, 0xff, 176, 169];
        assert_eq!(script.to_u8_vec(), expected_vec);
    }

    #[test]
    fn test_from_u8_vec() {
        let arr = vec![76, 0x02, 0xff, 0xff, 176, 169];
        let script = Script::from_u8_vec_new(&arr);
        let expected_chunks = vec![
            ScriptChunk::from_string_new("0xffff".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        assert_eq!(script.unwrap().chunks, expected_chunks);
    }

    #[test]
    fn test_from_u8_vec_2() {
        let input_string = "0xffff 0xffff";
        let expected_output_string = "0xffff 0xffff";

        // Convert the input string to a Script
        let script = Script::from_string_new(input_string).unwrap();

        // Convert the Script to a u8 vector
        let u8_vec = script.to_u8_vec();

        let script2 = Script::from_u8_vec_new(&u8_vec).unwrap();

        // Convert the Script back to a string
        let output_string = script2.to_string().unwrap();

        // Check that the output string is the same as the input string
        assert_eq!(output_string, expected_output_string);
    }

    #[test]
    fn test_from_u8_vec_new() {
        let arr = vec![76, 0x02, 0xff, 0xff, 176, 169];
        let script = Script::from_u8_vec_new(arr.as_slice());
        let expected_chunks = vec![
            ScriptChunk::from_string_new("0xffff".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        let new_script = Script::new(expected_chunks);
        let new_string = new_script.to_string().unwrap();
        assert_eq!(script.unwrap().to_string().unwrap(), new_string);
    }
}
