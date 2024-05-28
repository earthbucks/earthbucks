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

    pub fn from_iso_buf_reader(br: &mut IsoBufReader) -> Result<Self, String> {
        let header = Header::from_iso_buf_reader(br)?;
        let tx_count_varint = VarInt::from_iso_buf_reader(br)?;
        if !tx_count_varint.is_minimal() {
            return Err("non-minimally encoded varint".into());
        }
        let tx_count = tx_count_varint.to_u64()? as usize;
        let mut txs = vec![];
        for _ in 0..tx_count {
            let tx = Tx::from_iso_buf_reader(br).map_err(|_| "unable to parse transactions")?;
            txs.push(tx);
        }
        Ok(Self { header, txs })
    }

    pub fn to_buffer_writer(&self) -> IsoBufWriter {
        let mut bw = IsoBufWriter::new();
        bw.write_iso_buf(self.header.to_iso_buf());
        bw.write_iso_buf(VarInt::from_u64(self.txs.len() as u64).to_iso_buf());
        for tx in &self.txs {
            bw.write_iso_buf(tx.to_buffer_writer().to_iso_buf());
        }
        bw
    }

    pub fn to_iso_buf(&self) -> Vec<u8> {
        self.to_buffer_writer().to_iso_buf()
    }

    pub fn from_iso_buf(buf: Vec<u8>) -> Result<Self, String> {
        let mut br = IsoBufReader::new(buf);
        Self::from_iso_buf_reader(&mut br)
    }
}
