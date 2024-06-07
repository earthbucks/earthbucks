use tensorflow::Graph;
use tensorflow::Session;
use tensorflow::SessionOptions;
use tensorflow::Tensor;

pub struct GpuSession {
    working_block_id: Tensor<i32>,
    recent_block_ids: Tensor<i32>,
    session: Session,
}

impl GpuSession {
    pub fn new(working_block_id: [u8; 32], recent_block_ids: Vec<[u8; 32]>) -> Self {
        // data stored in main memory
        let working_block_id = Self::tensor_from_buffer_bits_alt1(&working_block_id);
        let recent_block_ids_concatted: Vec<u8> = recent_block_ids
            .iter()
            .flat_map(|x| x.iter())
            .cloned()
            .collect();
        let recent_block_ids = Self::tensor_from_buffer_bits_alt1(&recent_block_ids_concatted);

        // tensorflow session
        let graph = Graph::new();
        let session = Session::new(&SessionOptions::new(), &graph).unwrap();

        GpuSession {
            working_block_id,
            recent_block_ids,
            session,
        }
    }

    pub fn get_working_block_id(&self) -> Tensor<i32> {
        self.working_block_id.clone()
    }

    pub fn get_recent_block_ids(&self) -> Tensor<i32> {
        self.recent_block_ids.clone()
    }

    pub fn update_working_block_id(&mut self, working_block_id: [u8; 32]) {
        self.working_block_id = Self::tensor_from_buffer_bits_alt1(&working_block_id);
    }

    pub fn get_session(&self) -> &Session {
        &self.session
    }

    pub fn tensor_from_buffer_bits_alt1(buffer: &[u8]) -> Tensor<i32> {
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

    // tensorFromBufferBitsAlt2(buffer: SysBuf): TFTensor {
    //     // create a tensor by extracting every bit from the buffer into a new int32
    //     // value in a tensor. the new tensor has a bunch of int32 values that are
    //     // all either 0 or 1.
    //     //
    //     // this method is not efficient, but it shows the basic idea of using
    //     // arthmetic operations to do the same thing as bitwise operations.
    //     const bufferIter = buffer.values();
    //     const bits: number[] = [];
    //     let bit: number | undefined;
    //     while ((bit = bufferIter.next().value) !== undefined) {
    //       for (let i = 7; i >= 0; i--) {
    //         const shiftedBit = Math.floor(bit / Math.pow(2, i));
    //         bits.push(shiftedBit % 2);
    //       }
    //     }
    //     return this.tf.tensor1d(bits, "int32");
    //   }

    pub fn tensor_from_buffer_bits_alt2(buffer: &[u8]) -> Tensor<i32> {
        // create a tensor by extracting every bit from the buffer into a new int32
        // value in a tensor. the new tensor has a bunch of int32 values that are
        // all either 0 or 1.
        //
        // this method is not efficient, but it shows the basic idea of using
        // arthmetic operations to do the same thing as bitwise operations.
        let mut bits: Vec<i32> = Vec::new();
        for byte in buffer {
            let byte = *byte as i32;
            for i in (0..8).rev() {
                let shifted_bit = byte / 2_i32.pow(i as u32);
                bits.push(shifted_bit % 2);
            }
        }
        Tensor::new(&[bits.len() as u64])
            .with_values(&bits)
            .unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tensorflow::Shape;

    #[test]
    fn test_tensor_from_buffer_bits_alt1_1() {
        let buffer = [0xff];
        let tensor = GpuSession::tensor_from_buffer_bits_alt1(&buffer);
        assert_eq!(tensor.shape(), Shape::from([8]));
        let tensor_values = tensor.to_vec();
        assert_eq!(tensor_values, vec![1, 1, 1, 1, 1, 1, 1, 1]);
    }

    #[test]
    fn test_tensor_from_buffer_bits_alt2_1() {
        let buffer = [0xff];
        let tensor = GpuSession::tensor_from_buffer_bits_alt2(&buffer);
        assert_eq!(tensor.shape(), Shape::from([8]));
        let tensor_values = tensor.to_vec();
        assert_eq!(tensor_values, vec![1, 1, 1, 1, 1, 1, 1, 1]);
    }

    #[test]
    fn test_tensor_from_buffer_bits_alt2_2() {
        let buffer = [0x00];
        let tensor = GpuSession::tensor_from_buffer_bits_alt2(&buffer);
        assert_eq!(tensor.shape(), Shape::from([8]));
        let tensor_values = tensor.to_vec();
        assert_eq!(tensor_values, vec![0, 0, 0, 0, 0, 0, 0, 0]);
    }
}
