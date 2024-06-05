use crate::error::EbxError;
use crate::header::Header;
use crate::pkh::Pkh;
use crate::script::Script;
use crate::script_chunk::ScriptChunk;
use crate::tx::Tx;

// add Default
#[derive(Default, Clone)]
pub struct HeaderChain {
    pub headers: Vec<Header>,
}

impl HeaderChain {
    pub const LENGTH_TARGET_ADJ_PERIOD: u32 = Header::BLOCKS_PER_TARGET_ADJ_PERIOD;
    pub const LENGTH_EXPIRY_PERIOD: u32 = Script::PKHXR_90D_60D_X_LOCK_REL;
    pub const LENGTH_SAFETY_PERIOD: u32 = HeaderChain::LENGTH_EXPIRY_PERIOD * 2;

    pub fn new() -> Self {
        Self {
            headers: Vec::new(),
        }
    }

    pub fn add(&mut self, header: Header) -> &mut Self {
        self.headers.push(header);
        self
    }

    pub fn get_tip(&self) -> Option<&Header> {
        self.headers.last()
    }

    pub fn new_header_is_valid_at(&self, header: &Header, timestamp: u64) -> bool {
        header.is_valid_at(&self.headers, timestamp)
    }

    pub fn new_header_is_valid_now(&self, header: &Header) -> bool {
        header.is_valid_now(&self.headers)
    }

    pub fn get_next_coinbase_tx(&self, pkh: &Pkh, domain: &String) -> Tx {
        let building_block_n: u32 = self.headers.len() as u32;
        let domain_buf = domain.as_bytes();
        let script_chunk_domain = ScriptChunk::from_data(domain_buf.to_vec());
        let input_script = Script::new(vec![script_chunk_domain]);
        let output_script = Script::from_pkh_output(&pkh.buf);
        let output_amount = Header::coinbase_amount(building_block_n);
        Tx::from_coinbase(input_script, output_script, output_amount, building_block_n)
    }

    pub fn get_next_header(
        &self,
        merkle_root: [u8; 32],
        new_timestamp: u64,
    ) -> Result<Header, EbxError> {
        // valid block header, except for PoW
        let mut block_header: Header = Header::from_lch(&self.headers, new_timestamp)?;
        block_header.merkle_root = merkle_root;
        Ok(block_header)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::header::Header;
    use crate::numbers::u256;
    #[test]
    fn test_add() {
        let mut chain = HeaderChain::new();
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: u256::from(0u8),
            nonce: u256::from(0u8),
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        chain.add(header);
        assert_eq!(chain.headers.len(), 1);
    }

    #[test]
    fn test_get_tip() {
        let mut chain = HeaderChain::new();
        let header = Header {
            version: 0,
            prev_block_id: [0; 32],
            merkle_root: [0; 32],
            timestamp: 0,
            block_num: 0,
            target: u256::from(0u8),
            nonce: u256::from(0u8),
            work_ser_algo: 0,
            work_ser_hash: [0; 32],
            work_par_algo: 0,
            work_par_hash: [0; 32],
        };
        chain.add(header);
        assert_eq!(chain.get_tip().unwrap().version, 0);
    }
}
