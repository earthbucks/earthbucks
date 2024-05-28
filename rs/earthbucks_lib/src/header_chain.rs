use crate::{header::Header, pkh::Pkh, script::Script, script_chunk::ScriptChunk, tx::Tx};

// add Default
#[derive(Default, Clone)]
pub struct HeaderChain {
    pub headers: Vec<Header>,
}

impl HeaderChain {
    pub const LENGTH_TARGET_ADJ_PERIOD: u64 = Header::BLOCKS_PER_TARGET_ADJ;
    pub const LENGTH_EXPIRY_PERIOD: u64 = Script::PKHXR_90D_60D_X_LOCK_REL as u64;
    pub const LENGTH_SAFETY_PERIOD: u64 = HeaderChain::LENGTH_EXPIRY_PERIOD * 2;

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
        let building_block_n = self.headers.len();
        let domain_buf = domain.as_bytes();
        let script_chunk_domain = ScriptChunk::from_data(domain_buf.to_vec());
        let input_script = Script::new(vec![script_chunk_domain]);
        let output_script = Script::from_pkh_output(&pkh.buf);
        let output_amount = Header::coinbase_amount(building_block_n as u64);
        Tx::from_coinbase(
            input_script,
            output_script,
            output_amount,
            building_block_n as u64,
        )
    }

    pub fn get_next_header(
        &self,
        merkle_root: [u8; 32],
        new_timestamp: u64,
    ) -> Result<Header, String> {
        // valid block header, except for PoW
        let mut block_header: Header = Header::from_lch(&self.headers, new_timestamp)?;
        block_header.merkle_root = merkle_root;
        Ok(block_header)
    }
}
