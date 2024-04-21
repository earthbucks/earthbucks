// use std::vec;
use crate::blake3::blake3_hash;
use ndarray::Array2;

pub struct Matmul {
    source: [u8; 32],
}

impl Matmul {
    pub fn new(source: [u8; 32]) -> Self {
        Matmul { source }
    }

    pub fn create_256x256_binary_matrix(&self) -> Array2<u16> {
        // 256x256 matrix squared has worst case of value 256 being stored and
        // therefore we must use u16 or higher to store each value
        let mut matrix_data = Vec::new();

        let mut current_hash = blake3_hash(&self.source);

        for _ in 0..256 {
            for &byte in current_hash.iter() {
                for bit in 0..8 {
                    let value = ((byte >> bit) & 1) as u16;
                    matrix_data.push(value);
                }
            }
            current_hash = blake3_hash(&current_hash);
        }

        Array2::from_shape_vec((256, 256), matrix_data).unwrap()
    }

    pub fn create_1024x1024_binary_matrix(&self) -> Array2<u16> {
        let mut matrix_data = Vec::new();

        let mut current_hash = blake3_hash(&self.source);

        for _ in 0..(256 * 16) {
            for &byte in current_hash.iter() {
                for bit in 0..8 {
                    let value = ((byte >> bit) & 1) as u16;
                    matrix_data.push(value);
                }
            }
            current_hash = blake3_hash(&current_hash);
        }

        Array2::from_shape_vec((1024, 1024), matrix_data).unwrap()
    }

    pub fn square_with_ndarray(&self, matrix: Array2<u16>) -> Array2<u16> {
        matrix.dot(&matrix)
    }

    pub fn create_256x256_square_and_blake3_hash(&self) -> [u8; 32] {
        let matrix = self.create_256x256_binary_matrix();
        let squared = self.square_with_ndarray(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn create_1024x1024_square_and_blake3_hash(&self) -> [u8; 32] {
        let matrix = self.create_1024x1024_binary_matrix();
        let squared = self.square_with_ndarray(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn array_to_buffer(matrix: Array2<u16>) -> Vec<u16> {
        let mut buffer = Vec::new();

        for value in matrix.iter() {
            buffer.push(*value);
        }

        buffer
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    // use std::time::Instant;

    #[test]
    fn test_256x256_binary_matrix() {
        let source = [0u8; 32];
        let matmul = Matmul::new(source);

        let start = std::time::Instant::now();
        let matrix = matmul.create_256x256_binary_matrix();
        let elapsed = start.elapsed();
        println!("Time to create 256x256 matrix: {:?}", elapsed);

        let start = std::time::Instant::now();
        let squared_arr = matmul.square_with_ndarray(matrix.clone());
        let elapsed = start.elapsed();
        println!("Time to square 256x256 matrix with ndarray: {:?}", elapsed);

        let squared_buf_u16 = squared_arr.clone().into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        let squared_hex = hex::encode(squared_buf_u8);
        let squared_buf_2_u16 = Matmul::array_to_buffer(squared_arr);
        let squared_buf_2_u8: Vec<u8> = squared_buf_2_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        let squared_hex_2 = hex::encode(squared_buf_2_u8);
        assert_eq!(squared_hex, squared_hex_2);
    }

    #[test]
    fn test_create_256x256_square_and_blake3_hash() {
        let source = [0u8; 32];
        let matmul = Matmul::new(source);

        let start = std::time::Instant::now();
        let hash = matmul.create_256x256_square_and_blake3_hash();
        let elapsed = start.elapsed();
        println!(
            "Time to create 256x256 square and blake3 hash: {:?}",
            elapsed
        );

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f"
        );
    }

    // #[test]
    // fn test_1024x1024_binary_matrix() {
    //     let source = [0u8; 32];
    //     let matmul = Matmul::new(source);

    //     let start = std::time::Instant::now();
    //     let matrix = matmul.create_1024x1024_binary_matrix();
    //     let elapsed = start.elapsed();
    //     println!("Time to create 1024x1024 matrix: {:?}", elapsed);

    //     let start = std::time::Instant::now();
    //     let squared = matmul.square_with_ndarray(matrix.clone());
    //     let elapsed = start.elapsed();
    //     println!(
    //         "Time to square 1024x1024 matrix with ndarray: {:?}",
    //         elapsed
    //     );
    // }
}
