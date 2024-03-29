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
