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
        let mut hash_iter = current_hash.iter().peekable();

        for _ in 0..size {
            for _ in 0..size {
                if hash_iter.peek().is_none() {
                    current_hash = blake3_hash(&current_hash);
                    hash_iter = current_hash.iter().peekable();
                }
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
        }

        Array2::from_shape_vec((size, size), matrix_data).unwrap()
    }

    pub fn square_matrix(&self, matrix: Array2<u16>) -> Array2<u16> {
        matrix.dot(&matrix)
    }

    pub fn matmul_256(&self) -> [u8; 32] {
        let matrix = self.create_binary_matrix(256);
        let squared = self.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn matmul_400(&self) -> [u8; 32] {
        let matrix = self.create_binary_matrix(400);
        let squared = self.square_matrix(matrix);
        let squared_buf_u16 = squared.into_raw_vec();
        let squared_buf_u8: Vec<u8> = squared_buf_u16
            .iter()
            .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
            .collect();
        blake3_hash(&squared_buf_u8)
    }

    pub fn matmul_512(&self) -> [u8; 32] {
        let matrix = self.create_binary_matrix(512);
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
    fn test_matmul_256() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_256();
        let elapsed = start.elapsed();
        println!("Time for matmul-256: {:?}", elapsed);

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "fc4e101ec4a9afaa432a12e8e5475158517a93d5f1b978b35bc392b521cda84b"
        );
    }

    #[test]
    fn test_matmul_400() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_400();
        let elapsed = start.elapsed();
        println!("Time for matmul-400: {:?}", elapsed);

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "2ada02dbc002c6a7a6aa7c7ac6782c8b9a03537aa559a1ec23f47f390c593337"
        );
    }

    #[test]
    fn test_matmul_512() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_512();
        let elapsed = start.elapsed();
        println!("Time for matmul-512: {:?}", elapsed);

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "12fdfe51e4d96ce46df7cfae08fb3ee9b026abdbc7749b5e4051a8ebcb351534"
        );
    }

    #[test]
    fn test_matmul_1024() {
        let seed = [0u8; 32];
        let matmul = Matmul::new(seed);

        let start = std::time::Instant::now();
        let hash = matmul.matmul_1024();
        let elapsed = start.elapsed();
        println!("Time for matmul-1024: {:?}", elapsed);

        let hash_hex = hex::encode(hash);
        assert_eq!(
            hash_hex,
            "3d90f78f711c271da4ab7afb11092ac3dc446570792231837f1bd28816dfde1c"
        );
    }
}
