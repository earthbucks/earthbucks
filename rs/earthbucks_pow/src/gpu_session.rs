use tensorflow::ops;
use tensorflow::Graph;
use tensorflow::Scope;
use tensorflow::Session;
use tensorflow::SessionOptions;
use tensorflow::SessionRunArgs;
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

    // test method that takes a 1d tensor, creates a new session, sends it to
    // the GPU, replicates the tensor to fill a matrix, meaning that each row in
    // the matrix is the same as the original tensor, then squares the matrix,
    // and returns the result as a vector of i32.
    pub fn test_matrix_square(tensor: Tensor<i32>) -> Vec<i32> {
        let graph = Graph::new();
        let session = Session::new(&SessionOptions::new(), &graph).unwrap();

        let mut root = Scope::new_root_scope();
        // confirm tensor is 1d
        // the tensor is of size N
        // replicate the tensor N times to create a matrix of size NxN
        // square the matrix

        // Confirm tensor is 1D
        assert_eq!(tensor.dims().len(), 1);

        // The tensor is of size N
        let n = tensor.dims()[0] as usize;

        // Replicate the tensor N times to create a matrix of size NxN
        let op_tensor = ops::constant(tensor.clone(), &mut root).unwrap();
        let op_n = ops::constant(
            Tensor::new(&[1]).with_values(&[n as i32]).unwrap(),
            &mut root,
        )
        .unwrap();
        let op_tiled = ops::tile(op_tensor, op_n, &mut root).unwrap();
        let matrix = op_tiled;

        // Square the matrix
        let op_square = ops::square(matrix, &mut root).unwrap();

        let mut args = SessionRunArgs::new();
        args.add_target(&op_square);
        session.run(&mut args).unwrap();
        let token = args.request_fetch(&op_square, 0);
        let result_tensor: Tensor<i32> = args.fetch(token).unwrap();
        result_tensor.to_vec()
    }

    pub fn test_add() -> i32 {
        let graph = Graph::new();
        let session = Session::new(&SessionOptions::new(), &graph).unwrap();

        let mut root = Scope::new_root_scope();
        let a = ops::constant(Tensor::new(&[1]).with_values(&[1]).unwrap(), &mut root).unwrap();
        let b = ops::constant(Tensor::new(&[1]).with_values(&[2]).unwrap(), &mut root).unwrap();
        let c = ops::add(a, b, &mut root).unwrap();

        let mut args = SessionRunArgs::new();
        args.add_target(&c);
        session.run(&mut args).unwrap();
        let token = args.request_fetch(&c, 0);
        let result_tensor: Tensor<i32> = args.fetch(token).unwrap();
        result_tensor.to_vec()[0]
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

    // #[test]
    // fn test_matrix_square() {
    //     let tensor: Tensor<i32> = Tensor::new(&[2]).with_values(&[1, 0]).unwrap();
    //     let result = GpuSession::test_matrix_square(tensor);
    //     assert_eq!(result, vec![1, 0, 1, 0]);
    // }

    #[test]
    fn test_add() {
        let result = GpuSession::test_add();
        assert_eq!(result, 3);
    }
}
