use crate::script_chunk::ScriptChunk;

pub struct Script {
    chunks: Vec<ScriptChunk>,
}

impl Script {
    pub fn new(chunks: Vec<ScriptChunk>) -> Self {
        Self { chunks }
    }

    pub fn from_string(s: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let chunks: Result<Vec<ScriptChunk>, _> = s
            .split_whitespace()
            .map(|s| ScriptChunk::from_string_new(s.to_string()))
            .collect();
        Ok(Self::new(chunks?))
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

    pub fn from_u8_vec(&mut self, arr: &[u8]) {
        let mut offset = 0;
        while offset < arr.len() {
            let chunk = ScriptChunk::from_u8_vec_new(arr[offset..].to_vec())
                .expect("Failed to create ScriptChunk from byte array");
            let chunk_len = chunk.to_u8_vec().len();
            self.chunks.push(chunk);
            offset += chunk_len;
        }
    }

    pub fn from_u8_vec_new(arr: &[u8]) -> Self {
        let mut script = Self::new(Vec::new());
        script.from_u8_vec(arr);
        script
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
        let script = Script::from_string(s).unwrap();
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
        let mut script = Script::new(vec![]);
        let arr = vec![76, 0x02, 0xff, 0xff, 176, 169];
        script.from_u8_vec(&arr);
        let expected_chunks = vec![
            ScriptChunk::from_string_new("0xffff".to_string()).unwrap(),
            ScriptChunk::from_string_new("BLAKE3".to_string()).unwrap(),
            ScriptChunk::from_string_new("HASH160".to_string()).unwrap(),
        ];
        assert_eq!(script.chunks, expected_chunks);
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
        assert_eq!(script.to_string().unwrap(), new_string);
    }
}
