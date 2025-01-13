use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

// header size in bytes
const HEADER_SIZE: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32;

// the start and end of the nonce in the header
const NONCE_START: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32;
const NONCE_END: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4;

// the size of input data is both input matrices together, in bytes, and is a result of performing
// many sha256 hashes on the header
const INPUT_MATRIX_DATA_SIZE_BYTES: usize = 32 * 32 * 2;

// the two-dimensional size of the matrix, measured in "number of numbers" (u32)
const MATRIX_SIZE_NUMBERS: usize = (32 * 4) * (32 * 4); // 128 * 128

// output matrix size in bytes is the number of numbers times four. that is because we convert all
// u32 values into their full big-endian byte representation.
const OUTPUT_MATRIX_DATA_SIZE_BYTES: usize = (MATRIX_SIZE_NUMBERS) * 4;

#[wasm_bindgen]
pub struct Pow2 {
    header: Vec<u8>, // HEADER_SIZE
    current_nonce: u32,
    matrix_data: Vec<u8>,
    m1: Vec<u32>,
    m2: Vec<u32>,
    m3: Vec<u32>,
    m4: Vec<f32>,
    m4_bytes: Vec<u8>,
    m4_hash: Vec<u8>,
    final_nonce: u32,
}

#[wasm_bindgen]
impl Pow2 {
    /**
     * This is the reference implementation of EarthBucks Pow2. The purpose of writing this in rust
     * is twofold:
     * - Have a reference implementation with standardized test vectors for re-implementation in
     * WebGPU
     * - Be able to verify PoW solutions quickly on a CPU.
     */
    #[wasm_bindgen(constructor)]
    pub fn new(header: Vec<u8>, reset_nonce: bool) -> Result<Pow2, String> {
        // Validate header size
        if header.len() != HEADER_SIZE {
            return Err("Invalid header size".to_string());
        }

        // load current nonce from header using start and end
        let current_nonce: u32 = if reset_nonce {
            0
        } else {
            u32::from_be_bytes(header[NONCE_START..NONCE_END].try_into().unwrap())
        };

        Ok(Pow2 {
            header,
            current_nonce,
            matrix_data: vec![0; INPUT_MATRIX_DATA_SIZE_BYTES],
            m1: vec![0; MATRIX_SIZE_NUMBERS],
            m2: vec![0; MATRIX_SIZE_NUMBERS],
            m3: vec![0; MATRIX_SIZE_NUMBERS],
            m4: vec![0.0; MATRIX_SIZE_NUMBERS],
            m4_bytes: vec![0; OUTPUT_MATRIX_DATA_SIZE_BYTES],
            m4_hash: vec![0; 32],
            final_nonce: 0,
        })
    }

    /**
     * This uses the nonce to hash the header over and over, 64 times, and produce a very long
     * piece of data which we will turn into two pseudo-random matrices which we later multiply
     * together.
     */
    #[wasm_bindgen]
    pub fn create_matrix_data_from_hashes(&mut self) {
        let mut working_header = self.header.clone();

        let nonce = self.current_nonce;

        // Insert nonce into header at specified position
        working_header[NONCE_START..NONCE_END].copy_from_slice(&nonce.to_be_bytes());

        // First hash
        let mut hasher = Sha256::new();
        hasher.update(&working_header);
        let mut current_hash = hasher.finalize().to_vec();

        // Copy first hash to matrix_data
        self.matrix_data[0..32].copy_from_slice(&current_hash);

        // Perform the remaining 63 hashes and copy directly to matrix_data
        for i in 1..64 {
            let mut hasher = Sha256::new();
            hasher.update(&current_hash);
            current_hash = hasher.finalize().to_vec();
            let start = i * 32;
            let end = start + 32;
            self.matrix_data[start..end].copy_from_slice(&current_hash);
        }
    }

    /**
     * The next thing we want to do is as follows. We have generated two bits of data per element
     * in each matrix. What we want to do is to take each two bits, in big endian order, and
     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
     * fill them in from left to right.
     */
    #[wasm_bindgen]
    pub fn fill_in_matrices_from_data(&mut self) {
        let mut m1_index = 0;
        let mut m2_index = 0;

        for i in 0..INPUT_MATRIX_DATA_SIZE_BYTES / 2 {
            let byte = self.matrix_data[i];
            let twobits1: u32 = ((byte >> 6) & 0b11).into();
            let twobits2: u32 = ((byte >> 4) & 0b11).into();
            let twobits3: u32 = ((byte >> 2) & 0b11).into();
            let twobits4: u32 = (byte & 0b11).into();

            if m1_index < MATRIX_SIZE_NUMBERS {
                self.m1[m1_index] = twobits1;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_NUMBERS {
                self.m1[m1_index] = twobits2;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_NUMBERS {
                self.m1[m1_index] = twobits3;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_NUMBERS {
                self.m1[m1_index] = twobits4;
                m1_index += 1;
            }
        }

        for i in INPUT_MATRIX_DATA_SIZE_BYTES / 2..INPUT_MATRIX_DATA_SIZE_BYTES {
            let byte = self.matrix_data[i];
            let twobits1: u32 = ((byte >> 6) & 0b11).into();
            let twobits2: u32 = ((byte >> 4) & 0b11).into();
            let twobits3: u32 = ((byte >> 2) & 0b11).into();
            let twobits4: u32 = (byte & 0b11).into();

            if m2_index < MATRIX_SIZE_NUMBERS {
                self.m2[m2_index] = twobits1;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_NUMBERS {
                self.m2[m2_index] = twobits2;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_NUMBERS {
                self.m2[m2_index] = twobits3;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_NUMBERS {
                self.m2[m2_index] = twobits4;
                m2_index += 1;
            }
        }
    }

    /**
     * Now that we have the two matrices, we can multiply them together to get a third matrix.
     */
    #[wasm_bindgen]
    pub fn multiply_m1_times_m2_equals_m3(&mut self) {
        const M_SIZE: usize = 32 * 4;
        for i in 0..M_SIZE {
            for j in 0..M_SIZE {
                let mut sum: u32 = 0;
                for k in 0..M_SIZE {
                    sum += self.m1[i * M_SIZE + k] * self.m2[k * M_SIZE + j];
                }
                self.m3[i * M_SIZE + j] = sum;
            }
        }
    }

    /**
     * now we want to include a simple floating point operation. so we multiply each u32 value in
     * the m3 matrix by 3.14 to get the m3_float matrix
     */
    #[allow(clippy::approx_constant)]
    #[wasm_bindgen]
    pub fn multiply_m3_by_pi_to_get_m4(&mut self) {
        for i in 0..MATRIX_SIZE_NUMBERS {
            self.m4[i] = self.m3[i] as f32 * 3.14;
        }
    }

    /**
     * now that we have the result of the matrix multiplication, and we've converted that matrix
     * (m3) into a float matrix (m4), by multiplying it by 3.14, now we want to convert each one of
     * these floating point values into a byte representation. we use big-endian representation.
     */
    #[wasm_bindgen]
    pub fn convert_m4_to_bytes(&mut self) {
        for i in 0..MATRIX_SIZE_NUMBERS {
            let value = self.m4[i];
            let bytes = value.to_be_bytes();
            let start = i * 4;
            let end = start + 4;
            self.m4_bytes[start..end].copy_from_slice(&bytes);
        }
    }

    /**
     * Now that we have the result of the matrix multiplication, and performed one floating point
     * operation, we want to perform the sha256 hash of the output matrix (m4).
     */
    #[wasm_bindgen]
    pub fn hash_m4(&mut self) {
        let mut hasher = Sha256::new();
        hasher.update(&self.m4_bytes);
        self.m4_hash = hasher.finalize().to_vec();
    }

    /**
     * now we're getting ready to run the full algorithm. but first, we're going to to need a
     * method that looks at the output of the hash, m4_hash, and determines whether the first 11
     * bits are zero. if the first 11 bits are zero, return true. otherwise, return false.
     *
     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
     * equals the total number of operations to actually perform the PoW, but where verifying it
     * requires only a small fraction (just one 128x128 matmul).
     */
    #[wasm_bindgen]
    pub fn check_m4_hash_11_bits(&self) -> bool {
        // // Check first 11 bits
        // let first_byte = self.m4_hash[0];
        // let first_byte_bits = first_byte.leading_zeros();
        // first_byte_bits >= 9
        let first_two_bytes: u16 = u16::from_be_bytes(self.m4_hash[0..2].try_into().unwrap());
        first_two_bytes.leading_zeros() >= 11
    }

    /**
     * now let's put all the methods in order and run a single full-iteration of the pow algo
     */
    #[wasm_bindgen]
    pub fn run_single_iteration(&mut self) {
        self.create_matrix_data_from_hashes();
        self.fill_in_matrices_from_data();
        self.multiply_m1_times_m2_equals_m3();
        self.multiply_m3_by_pi_to_get_m4();
        self.convert_m4_to_bytes();
        self.hash_m4();
    }

    /**
     * now we are ready to perform the full proof-of-work algorithm. we want to iterate the nonce
     * as many times as it takes for check_m4_hash to return true. when it does, we want to set the
     * final_nonce to the current nonce.
     */
    #[wasm_bindgen]
    pub fn run_full_pow(&mut self) {
        // let mut count = 0;
        self.current_nonce += 1;
        self.run_single_iteration();
        while !self.check_m4_hash_11_bits() {
            // count += 1;
            // if count % 1000 == 0 {
            //     // Print progress every 1000 iterations
            //     assert!(count < 10, "PoW is taking too long");
            // }
            self.current_nonce += 1;
            self.run_single_iteration();
        }

        self.final_nonce = self.current_nonce;
    }

    /**
     * suppose we have a successful run. we need a method to get the header with the final nonce in
     * it.
     */
    #[wasm_bindgen]
    pub fn get_header_with_final_nonce(&self) -> Vec<u8> {
        let mut header = self.header.clone();
        header[NONCE_START..NONCE_END].copy_from_slice(&self.final_nonce.to_be_bytes());
        header
    }

    /**
     * now suppose we receive a header from somewhere, and we want to verify the pow. we should be
     * able to hash it, using the nonce already included in the header, and then run the full pow
     * algorithm, just one iteration, to verify the hash passes the check_m4_hash_11_bits method.
     */
    #[wasm_bindgen]
    pub fn verify_pow(header: Vec<u8>) -> Result<bool, String> {
        let mut pow = Pow2::new(header, false)?;

        pow.run_single_iteration();

        Ok(pow.check_m4_hash_11_bits())
    }
}

#[wasm_bindgen]
pub fn create_pow2(header: Vec<u8>, reset_nonce: bool) -> Result<Pow2, String> {
    Pow2::new(header, reset_nonce)
}

// first, expose sha256
#[wasm_bindgen]
pub fn sha256(input: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(input);
    hasher.finalize().to_vec()
}

#[cfg(test)]
mod tests {
    use super::*; // This brings in all items from the parent module

    #[test]
    fn test_create_matrix_data() {
        // Create a sample header of the correct size
        let header = vec![0; HEADER_SIZE];
        let mut pow = Pow2::new(header, true).unwrap();

        pow.create_matrix_data_from_hashes();

        // Add assertions here
        assert_eq!(pow.matrix_data.len(), INPUT_MATRIX_DATA_SIZE_BYTES);
    }

    #[test]
    fn test_create_matrix_data_changes() {
        // Create a sample header of the correct size
        let header = vec![0; HEADER_SIZE];
        let mut pow = Pow2::new(header.clone(), true).unwrap();

        pow.create_matrix_data_from_hashes();

        // test that iterating the nonce actually changes the matrix data
        let mut pow2 = Pow2::new(header, true).unwrap();
        pow2.create_matrix_data_from_hashes();
        let matrix_data = pow2.matrix_data.clone();
        pow2.current_nonce = 1;
        pow2.create_matrix_data_from_hashes();
        let matrix_data2 = pow2.matrix_data.clone();
        assert_ne!(matrix_data, matrix_data2);
        pow2.current_nonce = 2;
        pow2.create_matrix_data_from_hashes();
        let matrix_data3 = pow2.matrix_data.clone();
        assert_ne!(matrix_data2, matrix_data3);

        // Add assertions here
        assert_eq!(pow.matrix_data.len(), INPUT_MATRIX_DATA_SIZE_BYTES);
    }

    #[test]
    fn test_fill_in_matrices() {
        let header = vec![0; HEADER_SIZE];
        let mut pow = Pow2::new(header, true).unwrap();

        pow.create_matrix_data_from_hashes();
        pow.fill_in_matrices_from_data();

        // Add assertions here
        assert_eq!(pow.m1.len(), MATRIX_SIZE_NUMBERS);
        assert_eq!(pow.m2.len(), MATRIX_SIZE_NUMBERS);

        // Verify all values are 0-3
        for value in pow.m1.iter() {
            assert!(*value <= 3);
        }
        for value in pow.m2.iter() {
            assert!(*value <= 3);
        }
    }

    #[test]
    fn test_matrix_values_sanity() {
        // Create a header with some non-zero values to ensure randomness
        let mut header = vec![0; HEADER_SIZE];
        for (i, byte) in header.iter_mut().enumerate() {
            *byte = (i % 256) as u8;
        }

        let mut pow = Pow2::new(header, true).unwrap();
        pow.create_matrix_data_from_hashes();
        pow.fill_in_matrices_from_data();

        // Count occurrences of each value
        let mut m1_counts = [0u32; 4];
        let mut m2_counts = [0u32; 4];

        // Check m1
        for (i, value) in pow.m1.iter().enumerate() {
            assert!(*value <= 3, "M1[{}] contains value > 3: {}", i, value);
            m1_counts[*value as usize] += 1;
        }

        // Check m2
        for (i, value) in pow.m2.iter().enumerate() {
            assert!(*value <= 3, "M2[{}] contains value > 3: {}", i, value);
            m2_counts[*value as usize] += 1;
        }

        // Print distribution statistics
        println!("M1 value distribution:");
        for (i, count) in m1_counts.iter().enumerate() {
            println!(
                "Value {}: {} times ({:.2}%)",
                i,
                count,
                (*count as f64 / MATRIX_SIZE_NUMBERS as f64) * 100.0
            );
        }

        println!("\nM2 value distribution:");
        for (i, count) in m2_counts.iter().enumerate() {
            println!(
                "Value {}: {} times ({:.2}%)",
                i,
                count,
                (*count as f64 / MATRIX_SIZE_NUMBERS as f64) * 100.0
            );
        }

        // Verify total counts
        assert_eq!(pow.m1.len(), MATRIX_SIZE_NUMBERS);
        assert_eq!(pow.m2.len(), MATRIX_SIZE_NUMBERS);
    }

    #[test]
    fn test_multiply_m1_times_m2_equals_m3_sanity() {
        // Setup Pow2
        let header = vec![0; HEADER_SIZE];
        let mut pow = Pow2::new(header.clone(), true).unwrap();
        pow.create_matrix_data_from_hashes();
        pow.fill_in_matrices_from_data();

        // Run the multiplication
        pow.multiply_m1_times_m2_equals_m3();

        // Basic size check
        assert_eq!(pow.m3.len(), MATRIX_SIZE_NUMBERS);

        // Simple multiplication test case: set all m1 and m2 to 1
        let mut pow_simple = Pow2::new(header, true).unwrap();

        pow_simple.m1 = vec![1; MATRIX_SIZE_NUMBERS];
        pow_simple.m2 = vec![1; MATRIX_SIZE_NUMBERS];

        pow_simple.multiply_m1_times_m2_equals_m3();

        // all values in m3 should be 128
        for (i, value) in pow_simple.m3.iter().enumerate() {
            assert_eq!(*value, 128, "M3[{}] is not 128: {}", i, value);
        }
    }

    #[test]
    fn test_convert_m4_to_bytes_sanity() {
        // 1. Set up Pow2 and perform pre-requisite steps
        let header = vec![0; HEADER_SIZE];
        let mut pow = Pow2::new(header, true).unwrap();
        pow.create_matrix_data_from_hashes();
        pow.fill_in_matrices_from_data();
        pow.multiply_m1_times_m2_equals_m3();
        pow.multiply_m3_by_pi_to_get_m4();

        // 2. Run the Conversion
        pow.convert_m4_to_bytes();

        // 3. Verify Size
        assert_eq!(pow.m4_bytes.len(), OUTPUT_MATRIX_DATA_SIZE_BYTES);

        // 4. Sanity Check Values
        for i in 0..MATRIX_SIZE_NUMBERS {
            let expected_bytes = pow.m4[i].to_be_bytes();
            let start = i * 4;
            let end = start + 4;
            assert_eq!(
                &pow.m4_bytes[start..end],
                expected_bytes.as_slice(),
                "Mismatch at index {}",
                i
            );
        }
    }

    #[test]
    fn test_run_one_iteration() {
        // Create a header with some non-zero values to ensure randomness
        let mut header = vec![0; HEADER_SIZE];
        for (i, byte) in header.iter_mut().enumerate() {
            *byte = (i % 256) as u8;
        }

        // Initialize the Pow2 struct
        let mut pow = Pow2::new(header.clone(), true).unwrap();

        // Run the full PoW algorithm
        pow.run_single_iteration();

        // Verify that the final nonce was set.
        assert_eq!(pow.final_nonce, 0, "Final nonce was wrong");

        // print final hash in hex
        println!("Final Hash: {:?}", hex::encode(&pow.m4_hash));
    }

    #[test]
    fn test_run_full_pow() {
        // Create a header with some non-zero values to ensure randomness
        let mut header = vec![0; HEADER_SIZE];
        for (i, byte) in header.iter_mut().enumerate() {
            *byte = (i % 256) as u8;
        }

        // Initialize the Pow2 struct
        let mut pow = Pow2::new(header.clone(), true).unwrap();

        // Run the full PoW algorithm
        pow.run_full_pow();
        let header2 = pow.get_header_with_final_nonce();

        // Verify that the final nonce was set.
        assert_ne!(pow.final_nonce, 0, "Final nonce was not set");

        // Verify the PoW
        assert!(
            Pow2::verify_pow(header2).unwrap(),
            "PoW verification failed"
        );

        // print final hash in hex
        println!("Final Hash: {:?}", hex::encode(&pow.m4_hash));

        // Verify the first 11 bits of the m4 hash are zero for the final nonce
        let mut pow2 = Pow2::new(header.clone(), true).unwrap();
        pow2.current_nonce = pow.final_nonce;
        pow2.run_single_iteration();

        assert!(
            pow2.check_m4_hash_11_bits(),
            "Final hash does not have the first 11 bits zero"
        );
    }

    #[test]
    fn test_run_full_pow_benchmark() {
        use std::time::Instant;
        // Create a header with some non-zero values to ensure randomness
        let mut header = vec![0; HEADER_SIZE];
        for (i, byte) in header.iter_mut().enumerate() {
            *byte = (i % 256) as u8;
        }

        // Initialize the Pow2 struct
        let mut pow = Pow2::new(header.clone(), true).unwrap();

        // Time the full PoW algorithm
        let start = Instant::now();
        pow.run_full_pow();
        let duration = start.elapsed();
        println!("Time taken: {:?}", duration);

        let header2 = pow.get_header_with_final_nonce();

        // Verify that the final nonce was set.
        assert_ne!(pow.final_nonce, 0, "Final nonce was not set");

        // Verify the PoW
        //
        let start = Instant::now();
        let is_verified = Pow2::verify_pow(header2).unwrap();
        let duration = start.elapsed();
        println!("Time taken: {:?}", duration);
        assert!(is_verified, "PoW verification failed");

        println!("Final Hash: {:?}", hex::encode(&pow.m4_hash));

        // Verify the first 11 bits of the m4 hash are zero for the final nonce
        let mut pow2 = Pow2::new(header, true).unwrap();
        pow2.current_nonce = pow.final_nonce;
        pow2.run_single_iteration();

        assert!(
            pow2.check_m4_hash_11_bits(),
            "Final hash does not have the first 11 bits zero"
        );
    }
}
