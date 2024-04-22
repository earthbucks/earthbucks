use crate::blake3::blake3_hash;
use ndarray::Array2;

pub struct Matmul {
    seed: [u8; 32],
}

impl Matmul {
    pub fn new(seed: [u8; 32]) -> Self {
        Matmul { seed }
    }

    pub fn create_binary_matrix(&self, size: usize) -> Array2<u16> {
        let mut matrix_data = Vec::new();
    
        let mut current_hash = blake3_hash(&self.seed);
        let mut hash_iter = current_hash.iter().cycle();
    
        for _ in 0..size {
            for _ in 0..size {
                let byte = *hash_iter.next().unwrap();
                for bit in (0..8).rev() {
                    let value = ((byte >> bit) & 1) as u16;
                    matrix_data.push(value);
                }
                if matrix_data.len() >= size * size {
                    break;
                }
            }
            if matrix_data.len() >= size * size {
                break;
            }
            current_hash = blake3_hash(&current_hash);
            hash_iter = current_hash.iter().cycle();
        }
    
        Array2::from_shape_vec((size, size), matrix_data).unwrap()
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

    pub fn matmul_256a(&self) -> [u8; 32] {
        let matrix = self.create_binary_256_matrix();
        let squared = self.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn matmul_256b(&self) -> [u8; 32] {
        let matrix = self.create_binary_matrix(256);
        let squared = self.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn matmul_1024(&self) -> [u8; 32] {
        let matrix = self.create_binary_matrix(1024);
        let squared = self.square_matrix(matrix);
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
    fn test_matmul_256a() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_256a();
        let elapsed = start.elapsed();
        println!(
            "Time for matmul-256a: {:?}",
            elapsed
        );

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "5151c33bcff106a13e9635ff7bc5a903e8f983e6d99cd557c593b7644e23b77f"
        );
    }

    #[test]
    fn test_matmul_256b() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_256b();
        let elapsed = start.elapsed();
        println!(
            "Time for matmul-256b: {:?}",
            elapsed
        );

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "912084a59eab9332d290fa93ca91496d3ce6075927fef6ca724e96ec3c590b8b"
        );
    }

    #[test]
    fn test_matmul_1024() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_1024();
        let elapsed = start.elapsed();
        println!(
            "Time for matmul-1024: {:?}",
            elapsed
        );

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "04c3e8ce51fc457b430605e864cd2c8e2bc55309f6510cd104548bf976801d36"
        );
    }
}
