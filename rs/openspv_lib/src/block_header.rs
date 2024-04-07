use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;

pub struct BlockHeader {
    version: u32,                 // uint32
    previous_block_hash: Vec<u8>, // 256 bits
    merkle_root: Vec<u8>,         // 256 bits
    timestamp: u32,               // uint32
    difficulty: u32,              // 32 bits
    nonce: Vec<u8>,               // 256 bits
    index: u64,                   // uint64
}

impl BlockHeader {
    pub fn new(
        version: u32,
        previous_block_hash: Vec<u8>,
        merkle_root: Vec<u8>,
        timestamp: u32,
        difficulty: u32,
        nonce: Vec<u8>,
        index: u64,
    ) -> BlockHeader {
        BlockHeader {
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            difficulty,
            nonce,
            index,
        }
    }

    pub fn to_vec(&self) -> Vec<u8> {
        let mut bw = BufferWriter::new();
        bw.write_u32_be(self.version);
        bw.write_u8_vec(self.previous_block_hash.clone());
        bw.write_u8_vec(self.merkle_root.clone());
        bw.write_u32_be(self.timestamp);
        bw.write_u32_be(self.difficulty);
        bw.write_u8_vec(self.nonce.clone());
        bw.write_u64_be(self.index);
        bw.to_u8_vec()
    }

    pub fn from_vec(buf: Vec<u8>) -> Result<BlockHeader, &'static str> {
        let mut br = BufferReader::new(buf);
        let version = br.read_u32_be();
        let previous_block_hash = br.read_u8_vec(32);
        let merkle_root = br.read_u8_vec(32);
        let timestamp = br.read_u32_be();
        let difficulty = br.read_u32_be();
        let nonce = br.read_u8_vec(32);
        let index = br.read_u64_be();
        Ok(BlockHeader::new(
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            difficulty,
            nonce,
            index,
        ))
    }
}
