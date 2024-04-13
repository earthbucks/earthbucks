use crate::block_header::BlockHeader;

pub struct HeaderChain {
    pub headers: Vec<BlockHeader>,
}

impl HeaderChain {
    pub fn new() -> Self {
        Self {
            headers: Vec::new(),
        }
    }

    pub fn add(&mut self, header: BlockHeader) -> &mut Self {
        self.headers.push(header);
        self
    }

    pub fn get_tip(&self) -> Option<&BlockHeader> {
        self.headers.last()
    }

    pub fn header_is_valid(&self, header: &BlockHeader) -> bool {
        if let Some(tip) = self.get_tip() {
            if tip.id().to_vec() == header.prev_block_id {
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::block_header::BlockHeader;

    #[test]
    fn test_add() {
        let mut chain = HeaderChain::new();
        let header = BlockHeader::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header);
        assert_eq!(chain.headers.len(), 1);
    }

    #[test]
    fn test_get_tip() {
        let mut chain = HeaderChain::new();
        let header = BlockHeader::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header);
        assert_eq!(chain.get_tip().unwrap().version, 1);
    }

    #[test]
    fn test_header_is_valid() {
        let mut chain = HeaderChain::new();
        let header1 = BlockHeader::new(1, [0; 32], [0; 32], 1, [0; 32], [0; 32], 1);
        let header2 = BlockHeader::new(2, header1.id(), [0; 32], 1, [0; 32], [0; 32], 1);
        chain.add(header1);
        assert_eq!(chain.header_is_valid(&header2), true);
    }
}
