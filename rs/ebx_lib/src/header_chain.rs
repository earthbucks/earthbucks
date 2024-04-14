use crate::{
    header::Header, pkh::Pkh, script::Script, script_chunk::ScriptChunk, script_num::ScriptNum,
    tx::Tx,
};

pub struct HeaderChain {
    pub headers: Vec<Header>,
}

impl HeaderChain {
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

    pub fn header_is_valid(&self, header: &Header) -> bool {
        if let Some(tip) = self.get_tip() {
            if tip.id().to_vec() == header.prev_block_id {
                return true;
            }
        }
        false
    }

    pub fn get_next_coinbase(&self, pkh: Pkh) -> Tx {
        let building_block_n = self.headers.len();
        let script_num = ScriptNum::from_usize(building_block_n);
        let script_data = script_num.to_u8_vec();
        let script_chunk = ScriptChunk::from_data(script_data);
        let input_script = Script::new(vec![script_chunk]);
        let output_script = Script::from_pkh_output(&pkh.pkh);
        let output_amount = Header::coinbase_amount(building_block_n as u64);
        let coinbase_tx = Tx::from_coinbase(input_script, output_script, output_amount);
        coinbase_tx
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::header::Header;

    #[test]
    fn test_add() {
        let mut chain = HeaderChain::new();
        let header = Header::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header);
        assert_eq!(chain.headers.len(), 1);
    }

    #[test]
    fn test_get_tip() {
        let mut chain = HeaderChain::new();
        let header = Header::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header);
        assert_eq!(chain.get_tip().unwrap().version, 1);
    }

    #[test]
    fn test_header_is_valid() {
        let mut chain = HeaderChain::new();
        let header1 = Header::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        let header2 = Header::new(2, header1.id(), [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header1);
        assert_eq!(chain.header_is_valid(&header2), true);
    }
}
