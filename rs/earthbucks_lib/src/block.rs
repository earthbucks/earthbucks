use crate::ebx_error::EbxError;
use crate::header::Header;
use crate::iso_buf_reader::IsoBufReader;
use crate::iso_buf_writer::IsoBufWriter;
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

    pub fn from_iso_buf_reader(br: &mut IsoBufReader) -> Result<Self, EbxError> {
        let header = Header::from_iso_buf_reader(br)?;
        let tx_count_varint = VarInt::from_iso_buf_reader(br)?;
        if !tx_count_varint.is_minimal() {
            return Err(EbxError::NonMinimalEncodingError { source: None });
        }
        let tx_count = tx_count_varint.to_u64()? as usize;
        let mut txs = vec![];
        for _ in 0..tx_count {
            let tx = Tx::from_iso_buf_reader(br)?;
            txs.push(tx);
        }
        Ok(Self { header, txs })
    }

    pub fn to_buffer_writer(&self) -> IsoBufWriter {
        let mut bw = IsoBufWriter::new();
        bw.write(self.header.to_iso_buf().to_vec());
        bw.write(VarInt::from_u64(self.txs.len() as u64).to_iso_buf());
        for tx in &self.txs {
            bw.write(tx.to_buffer_writer().to_iso_buf());
        }
        bw
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        self.to_buffer_writer().to_iso_buf()
    }

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<Self, EbxError> {
        let mut br = IsoBufReader::new(buf);
        Self::from_iso_buf_reader(&mut br)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_buffer_writer() {
        let header = Header {
            version: 1,
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
        let tx = Tx::new(1, vec![], vec![], 1);
        let block = Block::new(header, vec![tx]);
        let bw = block.to_buffer_writer();
        assert!(!bw.to_iso_buf().is_empty());
    }

    #[test]
    fn test_to_iso_buf_and_from_iso_buf() {
        let header = Header {
            version: 1,
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
        let tx = Tx::new(1, vec![], vec![], 1);
        let block1 = Block::new(header, vec![tx]);
        let buf = block1.to_iso_buf();
        let block2 = Block::from_iso_buf(buf).unwrap();
        assert_eq!(block1.header.version, block2.header.version);
        assert_eq!(block1.txs[0].version, block2.txs[0].version);
    }

    #[test]
    fn test_from_iso_buf_reader() {
        let header = Header {
            version: 1,
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
        let tx = Tx::new(1, vec![], vec![], 1);
        let block1 = Block::new(header, vec![tx]);
        let buf = block1.to_iso_buf();
        let mut br = IsoBufReader::new(buf);
        let block2 = Block::from_iso_buf_reader(&mut br).unwrap();
        assert_eq!(block1.header.version, block2.header.version);
        assert_eq!(block1.txs[0].version, block2.txs[0].version);
    }

    #[test]
    fn test_is_genesis() {
        let header = Header {
            version: 1,
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
        let tx = Tx::new(1, vec![], vec![], 0);
        let block = Block::new(header, vec![tx]);
        assert!(block.header.is_genesis());
    }
}
