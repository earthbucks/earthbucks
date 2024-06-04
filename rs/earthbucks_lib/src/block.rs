use crate::buf_reader::BufReader;
use crate::buf_writer::BufWriter;
use crate::ebx_error::EbxError;
use crate::header::Header;
use crate::tx::Tx;
use crate::var_int::VarInt;

pub struct Block {
    pub header: Header,
    pub txs: Vec<Tx>,
}

impl Block {
    pub fn new(header: Header, txs: Vec<Tx>) -> Self {
        Self { header, txs }
    }

    pub fn from_buf_reader(br: &mut BufReader) -> Result<Self, EbxError> {
        let header = Header::from_buf_reader(br)?;
        let tx_count_varint = VarInt::from_buf_reader(br)?;
        if !tx_count_varint.is_minimal() {
            return Err(EbxError::NonMinimalEncodingError { source: None });
        }
        let tx_count = tx_count_varint.to_u64()? as usize;
        let mut txs = vec![];
        for _ in 0..tx_count {
            let tx = Tx::from_buf_reader(br)?;
            txs.push(tx);
        }
        Ok(Self { header, txs })
    }

    pub fn to_buffer_writer(&self) -> BufWriter {
        let mut bw = BufWriter::new();
        bw.write(self.header.to_buf().to_vec());
        bw.write(VarInt::from_u64(self.txs.len() as u64).to_buf());
        for tx in &self.txs {
            bw.write(tx.to_buffer_writer().to_buf());
        }
        bw
    }

    pub fn to_buf(&self) -> Vec<u8> {
        self.to_buffer_writer().to_buf()
    }

    pub fn from_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut br = BufReader::new(buf);
        Self::from_buf_reader(&mut br)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_buffer_writer() {
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let tx = Tx::new(0, vec![], vec![], 1);
        let block = Block::new(header, vec![tx]);
        let bw = block.to_buffer_writer();
        assert!(!bw.to_buf().is_empty());
    }

    #[test]
    fn test_to_buf_and_from_buf() {
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let tx = Tx::new(0, vec![], vec![], 1);
        let block1 = Block::new(header, vec![tx]);
        let buf = block1.to_buf();
        let block2 = Block::from_buf(buf).unwrap();
        assert_eq!(block1.header.version, block2.header.version);
        assert_eq!(block1.txs[0].version, block2.txs[0].version);
    }

    #[test]
    fn test_from_buf_reader() {
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let tx = Tx::new(0, vec![], vec![], 1);
        let block1 = Block::new(header, vec![tx]);
        let buf = block1.to_buf();
        let mut br = BufReader::new(buf);
        let block2 = Block::from_buf_reader(&mut br).unwrap();
        assert_eq!(block1.header.version, block2.header.version);
        assert_eq!(block1.txs[0].version, block2.txs[0].version);
    }

    #[test]
    fn test_is_genesis() {
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: [0; 32],
            nonce: [0; 32],
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        let tx = Tx::new(0, vec![], vec![], 0);
        let block = Block::new(header, vec![tx]);
        assert!(block.header.is_genesis());
    }
}
