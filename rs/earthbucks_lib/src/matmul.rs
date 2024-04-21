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

    pub fn square_binary_matrix(matrix: &Array2<u16>) -> Array2<u16> {
        let n = matrix.dim().0;
        let mut result = Array2::<u16>::zeros((n, n));
        for i in 0..n {
            for j in 0..n {
                for k in 0..n {
                    result[[i, j]] += matrix[[i, k]] & matrix[[k, j]];
                }
            }
        }
        result
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
        let squared = matmul.square_with_ndarray(matrix.clone());
        let elapsed = start.elapsed();
        println!("Time to square 256x256 matrix with ndarray: {:?}", elapsed);

        let start = std::time::Instant::now();
        let squared_manual = Matmul::square_binary_matrix(&matrix.clone());
        let elapsed = start.elapsed();
        println!("Time to square 256x256 matrix manually: {:?}", elapsed);

        assert_eq!(squared, squared_manual);
    }

    #[test]
    fn test_1024x1024_binary_matrix() {
        let source = [0u8; 32];
        let matmul = Matmul::new(source);

        let start = std::time::Instant::now();
        let matrix = matmul.create_1024x1024_binary_matrix();
        let elapsed = start.elapsed();
        println!("Time to create 1024x1024 matrix: {:?}", elapsed);

        let start = std::time::Instant::now();
        let squared = matmul.square_with_ndarray(matrix.clone());
        let elapsed = start.elapsed();
        println!(
            "Time to square 1024x1024 matrix with ndarray: {:?}",
            elapsed
        );

        let start = std::time::Instant::now();
        let squared_manual = Matmul::square_binary_matrix(&matrix.clone());
        let elapsed = start.elapsed();
        println!("Time to square 1024x1024 matrix manually: {:?}", elapsed);

        assert_eq!(squared, squared_manual);
    }
}
