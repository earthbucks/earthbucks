// use std::vec;
use crate::blake3::blake3_hash;
use ndarray::Array2;

pub struct Matmul {
    seed: [u8; 32],
}

impl Matmul {
    pub fn new(seed: [u8; 32]) -> Self {
        Matmul { seed }
    }

    pub fn create_binary_256_matrix(&self) -> Array2<u16> {
        let size = 256;
        let mut matrix_data = Vec::new();

        let mut current_hash = blake3_hash(&self.seed);

        for _ in 0..size {
            for &byte in current_hash.iter() {
                for bit in 0..8 {
                    let value = ((byte >> bit) & 1) as u16;
                    matrix_data.push(value);
                }
            }
            current_hash = blake3_hash(&current_hash);
        }

        Array2::from_shape_vec((size, size), matrix_data).unwrap()
    }

    pub fn square_matrix(&self, matrix: Array2<u16>) -> Array2<u16> {
        matrix.dot(&matrix)
    }

    pub fn create_256_square_and_blake3_hash(&self) -> [u8; 32] {
        let matrix = self.create_binary_256_matrix();
        let squared = self.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    // serial blake3 hash -> square 256x256 binary matrix -> blake3 hash
    pub fn matmul_256(&self) -> [u8; 32] {
        self.create_256_square_and_blake3_hash()
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
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let matrix = matmul.create_binary_256_matrix();
        let elapsed = start.elapsed();
        println!("Time to create 256x256 matrix: {:?}", elapsed);

        let start = std::time::Instant::now();
        let squared_arr = matmul.square_matrix(matrix.clone());
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
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_256();
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

        // now test by hand...
        let matrix = matmul.create_binary_256_matrix();
        // print as giant grid of 1s and 0s, because each value is either 1 or 0
        // for row in matrix.outer_iter() {
        //     let row_str: String = row.iter().map(|&x| format!("{}", x)).collect();
        //     println!("{}", row_str);
        //     break;
        // }
        let squared = matmul.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        // print the first 256 values as hex
        //let squared_hex = hex::encode(&squared_buf_u8[0..256]);
        //println!("First 256 bytes of squared matrix: {}", squared_hex);
        let squared_hash = blake3_hash(&squared_buf_u8);
        let squared_hash_hex = hex::encode(squared_hash);
        assert_eq!(hash_hex, squared_hash_hex);
    }
}
