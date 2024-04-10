use crate::blake3::{blake3_hash, double_blake3_hash};
use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use num_bigint::BigUint;
use num_integer::Integer;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct BlockHeader {
    pub version: u32,           // uint32
    pub prev_block_id: Vec<u8>, // 256 bits
    pub merkle_root: Vec<u8>,   // 256 bits
    pub timestamp: u64,         // uint32
    pub target: Vec<u8>,        // 32 bits
    pub nonce: Vec<u8>,         // 256 bits
    pub block_index: u64,             // uint64
}

impl BlockHeader {
    pub const BLOCKS_PER_ADJUSTMENT: u64 = 2016;
    pub const BLOCK_INTERVAL: u64 = 600;

    pub fn new(
        version: u32,
        prev_block_id: Vec<u8>,
        merkle_root: Vec<u8>,
        timestamp: u64,
        target: Vec<u8>,
        nonce: Vec<u8>,
        block_index: u64,
    ) -> BlockHeader {
        BlockHeader {
            version,
            prev_block_id,
            merkle_root,
            timestamp,
            target,
            nonce,
            block_index,
        }
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut bw = BufferWriter::new();
        bw.write_u32_be(self.version);
        bw.write_u8_vec(self.prev_block_id.clone());
        bw.write_u8_vec(self.merkle_root.clone());
        bw.write_u64_be(self.timestamp);
        bw.write_u8_vec(self.target.clone());
        bw.write_u8_vec(self.nonce.clone());
        bw.write_u64_be(self.block_index);
        bw.to_u8_vec()
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<BlockHeader, &'static str> {
        let mut br = BufferReader::new(buf);
        let version = br.read_u32_be();
        let previous_block_hash = br.read_u8_vec(32);
        let merkle_root = br.read_u8_vec(32);
        let timestamp = br.read_u64_be();
        let target = br.read_u8_vec(32);
        let nonce = br.read_u8_vec(32);
        let index = br.read_u64_be();
        Ok(BlockHeader::new(
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            target,
            nonce,
            index,
        ))
    }

    pub fn from_buffer_reader(br: &mut BufferReader) -> BlockHeader {
        let version = br.read_u32_be();
        let previous_block_hash = br.read_u8_vec(32);
        let merkle_root = br.read_u8_vec(32);
        let timestamp = br.read_u64_be();
        let target = br.read_u8_vec(32);
        let nonce = br.read_u8_vec(32);
        let index = br.read_u64_be();
        BlockHeader::new(
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            target,
            nonce,
            index,
        )
    }

    pub fn to_buffer_writer(&self) -> BufferWriter {
        let mut bw = BufferWriter::new();
        bw.write_u32_be(self.version);
        bw.write_u8_vec(self.prev_block_id.clone());
        bw.write_u8_vec(self.merkle_root.clone());
        bw.write_u64_be(self.timestamp);
        bw.write_u8_vec(self.target.clone());
        bw.write_u8_vec(self.nonce.clone());
        bw.write_u64_be(self.block_index);
        bw
    }

    pub fn to_string(&self) -> String {
        hex::encode(&self.to_u8_vec())
    }

    pub fn from_string(str: String) -> Result<BlockHeader, &'static str> {
        let buf = hex::decode(str).map_err(|_| "Invalid hex string")?;
        BlockHeader::from_u8_vec(buf)
    }

    pub fn is_valid_version(version: u32) -> bool {
        version == 1
    }

    pub fn is_valid_previous_block_hash(previous_block_hash: Vec<u8>) -> bool {
        previous_block_hash.len() == 32
    }

    pub fn is_valid_merkle_root(merkle_root: Vec<u8>) -> bool {
        merkle_root.len() == 32
    }
    pub fn is_valid_nonce(nonce: Vec<u8>) -> bool {
        nonce.len() == 32
    }

    pub fn is_valid_target(target: Vec<u8>) -> bool {
        target.len() == 32
    }

    pub fn is_valid(&self) -> bool {
        let len = self.to_u8_vec().len();
        if len != 148 {
            return false;
        }
        return BlockHeader::is_valid_version(self.version)
            && BlockHeader::is_valid_previous_block_hash(self.prev_block_id.clone())
            && BlockHeader::is_valid_merkle_root(self.merkle_root.clone())
            && BlockHeader::is_valid_nonce(self.nonce.clone())
            && BlockHeader::is_valid_target(self.target.clone());
    }

    pub fn is_genesis(&self) -> bool {
        self.block_index == 0 && self.prev_block_id.iter().all(|&x| x == 0)
    }

    pub fn from_genesis(initial_target: [u8; 32]) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        Self {
            version: 1,
            prev_block_id: [0; 32].to_vec(),
            merkle_root: [0; 32].to_vec(),
            timestamp,
            target: initial_target.to_vec(),
            nonce: [0; 32].to_vec(),
            block_index: 0,
        }
    }

    pub fn from_prev_block_header(
        prev_block_header: BlockHeader,
        prev_adjustment_block_header: Option<BlockHeader>,
    ) -> Result<Self, &'static str> {
        let prev_block_id = prev_block_header.id();
        let index = prev_block_header.block_index + 1;
        let mut target = prev_block_header.target.clone();
        if index % BlockHeader::BLOCKS_PER_ADJUSTMENT == 0 {
            match prev_adjustment_block_header {
                Some(pabh) if pabh.block_index + BlockHeader::BLOCKS_PER_ADJUSTMENT == index => {
                    let time_diff = prev_block_header.timestamp - pabh.timestamp;
                    target = BlockHeader::adjust_target(prev_block_header.target, time_diff);
                }
                _ => {
                    return Err("must provide previous adjustment block header 2016 blocks before")
                }
            }
        }
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let nonce = [0u8; 32].to_vec();
        Ok(Self::new(
            1,
            prev_block_id.to_vec(),
            [0u8; 32].to_vec(),
            timestamp,
            target,
            nonce,
            index,
        ))
    }

    pub fn hash(&self) -> [u8; 32] {
        blake3_hash(&self.to_u8_vec())
    }

    pub fn id(&self) -> [u8; 32] {
        double_blake3_hash(&self.to_u8_vec())
    }

    pub fn adjust_target(target_buf: Vec<u8>, time_diff: u64) -> Vec<u8> {
        let target = BigUint::from_bytes_be(&target_buf);
        let two_weeks = BlockHeader::BLOCKS_PER_ADJUSTMENT * BlockHeader::BLOCK_INTERVAL;
        let time_diff = time_diff as u64;
        let time_diff = if time_diff < two_weeks / 2 {
            two_weeks / 2
        } else if time_diff > two_weeks * 2 {
            two_weeks * 2
        } else {
            time_diff
        };
        let new_target = (target * time_diff).div_floor(&BigUint::from(two_weeks));
        let mut new_target_bytes = new_target.to_bytes_be();
        while new_target_bytes.len() < 32 {
            new_target_bytes.insert(0, 0);
        }
        new_target_bytes
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_u8_vec_and_from_u8_vec() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        let buf = bh1.to_u8_vec();
        let bh2 = BlockHeader::from_u8_vec(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_index, bh2.block_index);
    }

    #[test]
    fn test_to_buffer() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        let buf = bh1.to_u8_vec();
        let bh2 = BlockHeader::from_u8_vec(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_index, bh2.block_index);
    }

    #[test]
    fn test_is_valid() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        assert!(bh1.is_valid());
    }

    #[test]
    fn test_is_genesis() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        assert!(bh1.is_genesis());
    }

    #[test]
    fn test_hash() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        let hash = bh1.hash();
        let hex = hex::encode(hash);
        assert_eq!(
            hex,
            "ec821c0b0375d4e80eca5fb437652b2d53f32a613d4349d665a67406ba0d239e"
        );
    }

    #[test]
    fn test_id() {
        let bh1 = BlockHeader::new(1, vec![0; 32], vec![0; 32], 0, vec![0; 32], vec![0; 32], 0);
        let id = bh1.id();
        let hex = hex::encode(id);
        assert_eq!(
            hex,
            "8bbebda6265eb4265ff52f6e744d2859e6ef58c640e1df355072c4a9541b8aba"
        );
    }

    #[test]
    fn test_from_prev_block_header() {
        let prev_block_header = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
        );
        let bh = BlockHeader::from_prev_block_header(prev_block_header.clone(), None).unwrap();
        assert_eq!(bh.version, 1);
        assert_eq!(bh.prev_block_id, prev_block_header.id());
        assert_eq!(bh.merkle_root, [0u8; 32]);
        assert!(
            bh.timestamp
                <= SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_secs()
        );
        assert_eq!(bh.target, [0u8; 32]);
    }

    #[test]
    fn test_from_prev_block_header_adjustment() {
        let prev_block_header = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            BlockHeader::BLOCKS_PER_ADJUSTMENT - 1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            BlockHeader::BLOCKS_PER_ADJUSTMENT - 1,
        );
        let prev_adjustment_block_header = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
        );
        let bh = BlockHeader::from_prev_block_header(
            prev_block_header,
            Some(prev_adjustment_block_header),
        )
        .unwrap();
        assert_eq!(bh.block_index, BlockHeader::BLOCKS_PER_ADJUSTMENT);
        assert_eq!(bh.target, BlockHeader::adjust_target([0u8; 32].to_vec(), 0));
    }

    #[test]
    fn test_from_prev_block_header_non_trivial_adjustment() {
        // 00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        let initial_target_hex = "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let initial_target = hex::decode(initial_target_hex).unwrap();
        let time_diff = (2016 * 600) / 2; // One week
        let prev_block_header = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            time_diff - 1,
            initial_target.to_vec(),
            [0u8; 32].to_vec(),
            BlockHeader::BLOCKS_PER_ADJUSTMENT - 1,
        );
        let prev_adjustment_block_header = BlockHeader::new(
            1,
            [0u8; 32].to_vec(),
            [0u8; 32].to_vec(),
            0,
            initial_target.to_vec(),
            [0u8; 32].to_vec(),
            0,
        );
        let bh = BlockHeader::from_prev_block_header(
            prev_block_header,
            Some(prev_adjustment_block_header),
        )
        .unwrap();
        assert_eq!(bh.block_index, BlockHeader::BLOCKS_PER_ADJUSTMENT);
        let new_target_hex = "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let new_target = hex::decode(new_target_hex).unwrap();
        assert_eq!(bh.target, new_target);
    }

    #[test]
    fn test_adjust_target() {
        let prev_target = vec![0u8; 32];
        let time_diff = 0;
        assert_eq!(
            BlockHeader::adjust_target(prev_target, time_diff),
            vec![0u8; 32]
        );
    }

    #[test]
    fn test_adjust_target_less_than_one_week() {
        let target_buf =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap();
        let time_diff = 2016 * 200;
        let new_target = BlockHeader::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
    }

    #[test]
    fn test_adjust_target_more_than_eight_weeks() {
        let target_buf =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap();
        let time_diff = 2016 * 600 * 3;
        let new_target = BlockHeader::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "00000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffe"
        );
    }

    #[test]
    fn test_adjust_target_exactly_two_weeks() {
        let target_buf =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap();
        let time_diff = 2016 * 600;
        let new_target = BlockHeader::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
    }
}
