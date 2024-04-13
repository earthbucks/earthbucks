use crate::blake3::{blake3_hash, double_blake3_hash};
use crate::buffer::Buffer;
use crate::buffer_reader::BufferReader;
use crate::buffer_writer::BufferWriter;
use num_bigint::BigUint;
use num_integer::Integer;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone)]
pub struct Header {
    pub version: u32,            // uint32
    pub prev_block_id: [u8; 32], // 256 bits
    pub merkle_root: [u8; 32],   // 256 bits
    pub timestamp: u64,          // uint32
    pub target: [u8; 32],        // 32 bits
    pub nonce: [u8; 32],         // 256 bits
    pub block_num: u64,          // uint64
}

impl Header {
    pub const BLOCKS_PER_ADJUSTMENT: u64 = 2016;
    pub const BLOCK_INTERVAL: u64 = 600;
    pub const BLOCK_HEADER_SIZE: usize = 148;
    pub const INITIAL_TARGET: [u8; 32] = [0xff; 32];

    pub fn new(
        version: u32,
        prev_block_id: [u8; 32],
        merkle_root: [u8; 32],
        timestamp: u64,
        target: [u8; 32],
        nonce: [u8; 32],
        block_num: u64,
    ) -> Header {
        Header {
            version,
            prev_block_id,
            merkle_root,
            timestamp,
            target,
            nonce,
            block_num,
        }
    }

    pub fn to_u8_vec(&self) -> Vec<u8> {
        let mut bw = BufferWriter::new();
        bw.write_u32_be(self.version);
        bw.write_u8_vec(self.prev_block_id.to_vec());
        bw.write_u8_vec(self.merkle_root.to_vec());
        bw.write_u64_be(self.timestamp);
        bw.write_u8_vec(self.target.to_vec());
        bw.write_u8_vec(self.nonce.to_vec());
        bw.write_u64_be(self.block_num);
        bw.to_u8_vec()
    }

    pub fn from_u8_vec(buf: Vec<u8>) -> Result<Header, &'static str> {
        if buf.len() != Header::BLOCK_HEADER_SIZE {
            return Err("Invalid block header size");
        }
        let mut br = BufferReader::new(buf);
        let version = br.read_u32_be();
        let previous_block_hash: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let merkle_root: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let timestamp = br.read_u64_be();
        let target: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let nonce: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let index = br.read_u64_be();
        Ok(Header::new(
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            target,
            nonce,
            index,
        ))
    }

    pub fn from_buffer_reader(br: &mut BufferReader) -> Result<Header, &'static str> {
        if br.remainder_len() < Header::BLOCK_HEADER_SIZE {
            panic!("Invalid block header size");
        }
        let version = br.read_u32_be();
        let previous_block_hash: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let merkle_root: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let timestamp = br.read_u64_be();
        let target: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let nonce: [u8; 32] = br.read_u8_vec(32).try_into().unwrap();
        let index = br.read_u64_be();
        Ok(Header::new(
            version,
            previous_block_hash,
            merkle_root,
            timestamp,
            target,
            nonce,
            index,
        ))
    }

    pub fn to_buffer_writer(&self) -> BufferWriter {
        let mut bw = BufferWriter::new();
        bw.write_u32_be(self.version);
        bw.write_u8_vec(self.prev_block_id.to_vec());
        bw.write_u8_vec(self.merkle_root.to_vec());
        bw.write_u64_be(self.timestamp);
        bw.write_u8_vec(self.target.to_vec());
        bw.write_u8_vec(self.nonce.to_vec());
        bw.write_u64_be(self.block_num);
        bw
    }

    pub fn to_hex(&self) -> String {
        Buffer::from(self.to_u8_vec()).to_hex()
    }

    pub fn from_hex(hex: &str) -> Result<Header, &'static str> {
        let buf = Buffer::from_hex(hex).data;
        Header::from_u8_vec(buf)
    }

    pub fn to_string(&self) -> String {
        self.to_hex()
    }

    pub fn from_string(hex: &str) -> Result<Header, &'static str> {
        Header::from_hex(hex)
    }

    pub fn is_valid_version(version: u32) -> bool {
        version == 1
    }

    pub fn is_valid(&self) -> bool {
        let len = self.to_u8_vec().len();
        if len != Header::BLOCK_HEADER_SIZE {
            return false;
        }
        return Header::is_valid_version(self.version);
    }

    pub fn is_genesis(&self) -> bool {
        self.block_num == 0 && self.prev_block_id.iter().all(|&x| x == 0)
    }

    pub fn from_genesis() -> Self {
        let initial_target = Header::INITIAL_TARGET;
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        Self {
            version: 1,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp,
            target: initial_target,
            nonce: [0; 32],
            block_num: 0,
        }
    }

    pub fn from_prev_block_header(
        prev_block_header: Header,
        prev_adjustment_block_header: Option<Header>,
    ) -> Result<Self, &'static str> {
        let prev_block_id = prev_block_header.id();
        let index = prev_block_header.block_num + 1;
        let mut target = prev_block_header.target.clone();
        if index % Header::BLOCKS_PER_ADJUSTMENT == 0 {
            match prev_adjustment_block_header {
                Some(pabh) if pabh.block_num + Header::BLOCKS_PER_ADJUSTMENT == index => {
                    let time_diff = prev_block_header.timestamp - pabh.timestamp;
                    target = Header::adjust_target(prev_block_header.target, time_diff);
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
        let nonce = [0u8; 32];
        Ok(Self::new(
            1,
            prev_block_id,
            [0u8; 32],
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

    pub fn adjust_target(target_buf: [u8; 32], time_diff: u64) -> [u8; 32] {
        let target = BigUint::from_bytes_be(&target_buf);
        let two_weeks = Header::BLOCKS_PER_ADJUSTMENT * Header::BLOCK_INTERVAL;
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
        new_target_bytes.try_into().unwrap()
    }

    pub fn coinbase_amount(block_num: u64) -> u64 {
        // shift every 210,000 blocks
        let shift_by = block_num / 210_000;
        100 * 100_000_000 >> shift_by
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_u8_vec_and_from_u8_vec() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        let buf = bh1.to_u8_vec();
        let bh2 = Header::from_u8_vec(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_num, bh2.block_num);
    }

    #[test]
    fn test_to_buffer() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        let buf = bh1.to_u8_vec();
        let bh2 = Header::from_u8_vec(buf).unwrap();
        assert_eq!(bh1.version, bh2.version);
        assert_eq!(bh1.prev_block_id, bh2.prev_block_id);
        assert_eq!(bh1.merkle_root, bh2.merkle_root);
        assert_eq!(bh1.timestamp, bh2.timestamp);
        assert_eq!(bh1.target, bh2.target);
        assert_eq!(bh1.nonce, bh2.nonce);
        assert_eq!(bh1.block_num, bh2.block_num);
    }

    #[test]
    fn test_is_valid() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        assert!(bh1.is_valid());
    }

    #[test]
    fn test_is_genesis() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        assert!(bh1.is_genesis());
    }

    #[test]
    fn test_hash() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        let hash = bh1.hash();
        let hex = hex::encode(hash);
        assert_eq!(
            hex,
            "ec821c0b0375d4e80eca5fb437652b2d53f32a613d4349d665a67406ba0d239e"
        );
    }

    #[test]
    fn test_id() {
        let bh1 = Header::new(1, [0; 32], [0; 32], 0, [0; 32], [0; 32], 0);
        let id = bh1.id();
        let hex = hex::encode(id);
        assert_eq!(
            hex,
            "8bbebda6265eb4265ff52f6e744d2859e6ef58c640e1df355072c4a9541b8aba"
        );
    }

    #[test]
    fn test_from_prev_block_header() {
        let prev_block_header = Header::new(1, [0u8; 32], [0u8; 32], 0, [0u8; 32], [0u8; 32], 0);
        let bh = Header::from_prev_block_header(prev_block_header.clone(), None).unwrap();
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
        let prev_block_header = Header::new(
            1,
            [0u8; 32],
            [0u8; 32],
            Header::BLOCKS_PER_ADJUSTMENT - 1,
            [0u8; 32],
            [0u8; 32],
            Header::BLOCKS_PER_ADJUSTMENT - 1,
        );
        let prev_adjustment_block_header =
            Header::new(1, [0u8; 32], [0u8; 32], 0, [0u8; 32], [0u8; 32], 0);
        let bh =
            Header::from_prev_block_header(prev_block_header, Some(prev_adjustment_block_header))
                .unwrap();
        assert_eq!(bh.block_num, Header::BLOCKS_PER_ADJUSTMENT);
        assert_eq!(bh.target, Header::adjust_target([0u8; 32], 0));
    }

    #[test]
    fn test_from_prev_block_header_non_trivial_adjustment() {
        // 00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff
        let initial_target_hex = "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let initial_target: [u8; 32] = hex::decode(initial_target_hex).unwrap().try_into().unwrap();
        let time_diff = (2016 * 600) / 2; // One week
        let prev_block_header = Header::new(
            1,
            [0u8; 32],
            [0u8; 32],
            time_diff - 1,
            initial_target,
            [0u8; 32],
            Header::BLOCKS_PER_ADJUSTMENT - 1,
        );
        let prev_adjustment_block_header =
            Header::new(1, [0u8; 32], [0u8; 32], 0, initial_target, [0u8; 32], 0);
        let bh =
            Header::from_prev_block_header(prev_block_header, Some(prev_adjustment_block_header))
                .unwrap();
        assert_eq!(bh.block_num, Header::BLOCKS_PER_ADJUSTMENT);
        let new_target_hex = "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        let new_target: [u8; 32] = hex::decode(new_target_hex).unwrap().try_into().unwrap();
        assert_eq!(bh.target, new_target);
    }

    #[test]
    fn test_adjust_target() {
        let prev_target = [0u8; 32];
        let time_diff = 0;
        assert_eq!(Header::adjust_target(prev_target, time_diff), [0u8; 32]);
    }

    #[test]
    fn test_adjust_target_less_than_one_week() {
        let target_buf: [u8; 32] =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap()
                .try_into()
                .unwrap();
        let time_diff = 2016 * 200;
        let new_target = Header::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "000000007fffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
    }

    #[test]
    fn test_adjust_target_more_than_eight_weeks() {
        let target_buf: [u8; 32] =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap()
                .try_into()
                .unwrap();
        let time_diff = 2016 * 600 * 3;
        let new_target = Header::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "00000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffe"
        );
    }

    #[test]
    fn test_adjust_target_exactly_two_weeks() {
        let target_buf: [u8; 32] =
            hex::decode("00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
                .unwrap()
                .try_into()
                .unwrap();
        let time_diff = 2016 * 600;
        let new_target = Header::adjust_target(target_buf, time_diff);
        assert_eq!(
            hex::encode(new_target),
            "00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        );
    }

    #[test]
    fn test_coinbase_amount() {
        assert_eq!(Header::coinbase_amount(0), 10_000_000_000);
        assert_eq!(Header::coinbase_amount(210_000), 5_000_000_000);
        assert_eq!(Header::coinbase_amount(420_000), 2_500_000_000);
        assert_eq!(Header::coinbase_amount(630_000), 1_250_000_000);
        assert_eq!(Header::coinbase_amount(840_000), 625_000_000);
        assert_eq!(Header::coinbase_amount(1_050_000), 312_500_000);
        assert_eq!(Header::coinbase_amount(1_260_000), 156_250_000);

        let mut sum = 0;
        for i in 0..2_000_000 {
            sum += Header::coinbase_amount(i);
        }
        assert_eq!(sum, 4193945312500000);
    }
}
