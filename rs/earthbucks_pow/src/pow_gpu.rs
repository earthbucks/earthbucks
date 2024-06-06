use tensorflow::Tensor;

pub struct PowGpu {
    prev_block_ids: Vec<[u8; 32]>,
    working_block_id: Tensor<i32>,
    recent_block_ids: Tensor<i32>,
}

impl PowGpu {
    pub fn new(working_block_id: [u8; 32], recent_block_ids: Vec<[u8; 32]>) -> Self {
        let working_block_id = Self::tensor_from_buffer_bits(&working_block_id);
        let recent_block_ids_concatted: Vec<u8> = recent_block_ids
            .iter()
            .flat_map(|x| x.iter())
            .cloned()
            .collect();
        let recent_block_ids = Self::tensor_from_buffer_bits(&recent_block_ids_concatted);
        PowGpu {
            prev_block_ids: Vec::new(),
            working_block_id,
            recent_block_ids,
        }
    }

    pub fn get_prev_block_ids(&self) -> Vec<[u8; 32]> {
        self.prev_block_ids.clone()
    }

    pub fn get_working_block_id(&self) -> Tensor<i32> {
        self.working_block_id.clone()
    }

    pub fn get_recent_block_ids(&self) -> Tensor<i32> {
        self.recent_block_ids.clone()
    }

    pub fn tensor_from_buffer_bits(buffer: &[u8]) -> Tensor<i32> {
        // create a tensor by extracting every bit from the buffer into a new int32
        // value in a tensor. the new tensor has a bunch of int32 values that are
        // all either 0 or 1.
        let mut bits: Vec<i32> = Vec::new();
        for byte in buffer {
            let byte = *byte as i32;
            for i in (0..8).rev() {
                bits.push((byte >> i) & 1);
            }
        }
        Tensor::new(&[bits.len() as u64])
            .with_values(&bits)
            .unwrap()
    }

    pub fn update_working_block_id(&mut self, working_block_id: [u8; 32]) {
        self.working_block_id = Self::tensor_from_buffer_bits(&working_block_id);
    }

    // tensorSeed(): TFTensor {
    //   return this.tf.concat([this.workingBlockId, this.recentBlockIds]);
    // }

    // pub fn tensor_seed(&self) -> Tensor<i32> {
    //     // concatenate the working block id and the recent block ids into a single tensor
    //     // by concatenating the two tensors together.
    //     self.working_block_id.concat(&self.recent_block_ids, 0).unwrap()
    // }
}
