use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

const HEADER_SIZE: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: usize = 32;
const MANY_HASH_1_SIZE: usize = 32 * 32 * 4 * 2; // 8192
const MATRIX_SIZE_1D: usize = 32 * 4; // 128
const MATRIX_SIZE_2D: usize = (32 * 4) * (32 * 4); // 16384
const M4_BYTES_SIZE: usize = MATRIX_SIZE_2D * 4; // 65536
const MANY_HASH_2_SIZE: usize = (65536 / 256) * 32; // 8192
const FINAL_HASH_SIZE: usize = 32;

#[wasm_bindgen]
pub struct Pow3 {
    header: [u8; HEADER_SIZE],
    current_nonce: u32,
    working_header: [u8; HEADER_SIZE],
    working_header_hash: [u8; HASH_SIZE],
    many_hash_1: [u8; MANY_HASH_1_SIZE],
    m1: [u32; MATRIX_SIZE_2D],
    m2: [u32; MATRIX_SIZE_2D],
    m3: [u32; MATRIX_SIZE_2D],
    m4: [f32; MATRIX_SIZE_2D],
    m4_bytes: [u8; M4_BYTES_SIZE],
    many_hash_2: [u8; MANY_HASH_2_SIZE],
    final_hash: [u8; FINAL_HASH_SIZE],
    final_hash_starts_with_11_zeros: bool,
    final_nonce: u32,
}

#[wasm_bindgen]
impl Pow3 {
    /**
     * This is the reference implementation of EarthBucks Pow3. The purpose of writing this in rust
     * is twofold:
     * - Have a reference implementation with standardized test vectors for re-implementation in
     * WebGPU
     * - Be able to verify PoW solutions quickly on a CPU.
     */
    #[wasm_bindgen(constructor)]
    pub fn new(header: Vec<u8>) -> Result<Pow3, String> {
        // Validate header size
        if header.len() != HEADER_SIZE {
            return Err("Invalid header size".to_string());
        }

        Ok(Pow3 {
            header: header.try_into().unwrap(),
            current_nonce: 0,
            working_header: [0; HEADER_SIZE],
            working_header_hash: [0; HASH_SIZE],
            many_hash_1: [0; MANY_HASH_1_SIZE],
            m1: [0; MATRIX_SIZE_2D],
            m2: [0; MATRIX_SIZE_2D],
            m3: [0; MATRIX_SIZE_2D],
            m4: [0.0; MATRIX_SIZE_2D],
            m4_bytes: [0; M4_BYTES_SIZE],
            many_hash_2: [0; MANY_HASH_2_SIZE],
            final_hash: [0; FINAL_HASH_SIZE],
            final_hash_starts_with_11_zeros: false,
            final_nonce: 0,
        })
    }

    #[wasm_bindgen]
    pub fn set_nonce_from_header(&mut self) {
        let current_nonce: u32 =
            u32::from_be_bytes(self.header[NONCE_START..NONCE_END].try_into().unwrap());
        self.current_nonce = current_nonce;
    }

    #[wasm_bindgen]
    pub fn increment_nonce(&mut self) {
        self.current_nonce += 1;
    }

    #[wasm_bindgen]
    pub fn set_working_header(&mut self) {
        self.working_header = self.header;
        self.working_header[NONCE_START..NONCE_END]
            .copy_from_slice(&self.current_nonce.to_be_bytes());
    }

    #[wasm_bindgen]
    pub fn hash_working_header(&mut self) {
        let mut hasher = Sha256::new();
        hasher.update(self.working_header);
        self.working_header_hash.copy_from_slice(&hasher.finalize());
    }

    /*
     *  Now the next step is slightly unusual and is designed to be parallelized when
     *  re-implemented in WebGPU. Our goal is to fill many_hash_1 with pseudo-random data. Although
     *  the rust implementation is serial, our goal is to make it easy to run 256 threads at once
     *  when implemented in WebGPU. So what we do is to iterate a number, called 'count', a u32,
     *  from zero to two fifty five. This number will be expanded into *little* endian, so that the
     *  least significant byte is changing from 0 to 255 and is first. It will be the first four
     *  bytes of a new buffer. After 'count' is expressed in little endian, the remaining 32 bytes
     *  of the buffer are filled with the hash of the working header. We then take the sha256 hash
     *  of this whole buffer (a total of 4 + 32 = 36 bytes), and store it in many_hash_1, indexed
     *  by 'count'. This is repeated 256 times, so that many_hash_1 is a 2048 byte buffer.
     *
     *  Again, this happens in series in Rust, but because each of the 256 hashes are independent,
     *  they can be calculated in parallel in WebGPU.
     */
    #[wasm_bindgen]
    pub fn fill_many_hash_1(&mut self) {
        for count in 0..256 {
            let mut buffer: [u8; 36] = [0; 36];
            buffer[0..4].copy_from_slice(&(count as u32).to_le_bytes());
            buffer[4..36].copy_from_slice(&self.working_header_hash);
            let mut hasher = Sha256::new();
            hasher.update(buffer);
            let hash = hasher.finalize();
            let i_usize = count as usize;
            self.many_hash_1[i_usize * 32..(i_usize + 1) * 32].copy_from_slice(&hash);
        }
    }

    /**
     * The next thing we want to do is as follows. We have generated two bits of data per element
     * in each matrix. What we want to do is to take each two bits, in big endian order, and
     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
     * fill them in from left to right. This function is for the first matrix. The next function is
     * for the second matrix.
     */
    #[wasm_bindgen]
    pub fn create_m1_from_many_hash_1(&mut self) {
        let mut m1_index = 0;

        for i in 0..(MANY_HASH_1_SIZE / 2) {
            let byte = self.many_hash_1[i];
            let twobits1: u32 = ((byte >> 6) & 0b11).into();
            let twobits2: u32 = ((byte >> 4) & 0b11).into();
            let twobits3: u32 = ((byte >> 2) & 0b11).into();
            let twobits4: u32 = (byte & 0b11).into();

            if m1_index < MATRIX_SIZE_2D {
                self.m1[m1_index] = twobits1;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                self.m1[m1_index] = twobits2;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                self.m1[m1_index] = twobits3;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                self.m1[m1_index] = twobits4;
                m1_index += 1;
            }
        }
    }

    #[wasm_bindgen]
    pub fn create_m2_from_many_hash_1(&mut self) {
        let mut m2_index = 0;

        for i in (MANY_HASH_1_SIZE / 2)..(MANY_HASH_1_SIZE) {
            let byte = self.many_hash_1[i];
            let twobits1: u32 = ((byte >> 6) & 0b11).into();
            let twobits2: u32 = ((byte >> 4) & 0b11).into();
            let twobits3: u32 = ((byte >> 2) & 0b11).into();
            let twobits4: u32 = (byte & 0b11).into();

            if m2_index < MATRIX_SIZE_2D {
                self.m2[m2_index] = twobits1;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                self.m2[m2_index] = twobits2;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                self.m2[m2_index] = twobits3;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                self.m2[m2_index] = twobits4;
                m2_index += 1;
            }
        }
    }

    /**
     * Now that we have the two matrices, we can multiply them together to get a third matrix. we
     * don't make any attempt to parallelize this operation. it will look different in wgsl.
     */
    #[wasm_bindgen]
    pub fn multiply_m1_times_m2_equals_m3(&mut self) {
        const M_SIZE: usize = MATRIX_SIZE_1D;
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
     * the m3 matrix by 3.14 to get the m3_float matrix.
     */
    #[allow(clippy::approx_constant)]
    #[wasm_bindgen]
    pub fn multiply_m3_by_pi_to_get_m4(&mut self) {
        for i in 0..MATRIX_SIZE_2D {
            self.m4[i] = self.m3[i] as f32 * 3.14;
        }
    }

    /**
     * now before hashing the matrix, we need to convert it to bytes. we do this by taking each f32
     * value, and converting it to a u8 array of 4 bytes. we then store these bytes in big endian
     * in the m4_bytes array. this is a 65536 byte array. again, to prepare for parallelism of size
     * 256, we have an outer loop of 256, with an inner loop of whatever the remainder is.
     */
    #[wasm_bindgen]
    pub fn convert_m4_to_bytes(&mut self) {
        for i in 0..256 {
            for j in 0..(MATRIX_SIZE_2D / 256) {
                let k = j + i * (MATRIX_SIZE_2D / 256);
                let value_float = self.m4[k];
                let value_uint = value_float.to_bits();
                let bytes = value_uint.to_be_bytes();
                let start = k * 4;
                let end = start + 4;
                self.m4_bytes[start..end].copy_from_slice(&bytes);
            }
        }
    }

    /**
     * now that we've got the m4 matrix in bytes, we are ready to hash it. now, as before, instead
     * of hashing this large value, which would be a giant serial operation, we want to hash it in
     * indepenent pieces so that it can be parallelized. our goal, as usual, is to have 256
     * simultaneous threads going on the gpu, so we need to break up the hashing into 256 separate
     * pieces. the simplest way to do this is to just run sha256 on each of 256 equal sized pieces.
     * after this stage, then there will be another stage hashing all those pieces together
     * (serially) for the final hash.
     */
    #[wasm_bindgen]
    pub fn create_many_hash_2_from_m4_bytes(&mut self) {
        for i in 0..256 {
            let start = i * 256;
            let end = (i + 1) * 256;
            let slice = &self.m4_bytes[start..end];
            let mut hasher = Sha256::new();
            hasher.update(slice);
            let hash = hasher.finalize();
            self.many_hash_2[i * 32..(i + 1) * 32].copy_from_slice(&hash);
        }
    }

    /**
     * now that we've done a bunch of parallel hashes, we now have a piece of data that is 8192
     * bytes long, which is far shorter than the 65536 bytes from the previous stage, but not long
     * enough to justify hashing in parallel. so we just want one final serial hash on this data,
     * to produce final_hash_data
     */
    #[wasm_bindgen]
    pub fn create_final_hash_from_many_hash_2(&mut self) {
        let mut hasher = Sha256::new();
        hasher.update(self.many_hash_2);
        self.final_hash.copy_from_slice(&hasher.finalize());
    }

    /**
     * we're going to to need a method that looks at the output of the final hash and determines
     * whether the first 11 bits are zero. if the first 11 bits are zero, return true. otherwise,
     * return false.
     *
     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
     * equals the total number of operations to actually perform the PoW, but where verifying it
     * requires only a small fraction (just one 128x128 matmul instead of 1627x1627).
     */
    #[wasm_bindgen]
    pub fn check_final_hash_starts_with_11_zeros(&mut self) {
        let first_two_bytes: u16 = u16::from_be_bytes(self.final_hash[0..2].try_into().unwrap());
        let r = first_two_bytes.leading_zeros() >= 11;
        self.final_hash_starts_with_11_zeros = r;
        if r {
            self.final_nonce = self.current_nonce;
        }
    }

    #[wasm_bindgen]
    pub fn get_working_header(&self) -> Vec<u8> {
        self.working_header.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_working_header_hash(&self) -> Vec<u8> {
        self.working_header_hash.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_many_hash_1(&self) -> Vec<u8> {
        self.many_hash_1.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_m1(&self) -> Vec<u32> {
        self.m1.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_m2(&self) -> Vec<u32> {
        self.m2.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_m3(&self) -> Vec<u32> {
        self.m3.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_m4(&self) -> Vec<f32> {
        self.m4.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_m4_bytes(&self) -> Vec<u8> {
        self.m4_bytes.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_many_hash_2(&self) -> Vec<u8> {
        self.many_hash_2.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_final_hash(&self) -> Vec<u8> {
        self.final_hash.to_vec()
    }

    #[wasm_bindgen]
    pub fn get_final_hash_starts_with_11_zeros(&self) -> bool {
        self.final_hash_starts_with_11_zeros
    }

    #[wasm_bindgen]
    pub fn get_final_nonce(&self) -> u32 {
        self.final_nonce
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_header() -> Vec<u8> {
        let mut header = vec![0u8; HEADER_SIZE];
        // Set a specific value for testing, for example, set the first byte to 1.
        header[0] = 1;
        // Set a dummy nonce for testing, for example, set it to 0x01020304 big endian
        header[NONCE_START..NONCE_END].copy_from_slice(&[0x01, 0x02, 0x03, 0x04]);

        header
    }

    #[test]
    fn test_fill_many_hash_1() {
        let header = create_test_header();
        let mut pow = Pow3::new(header).unwrap();
        pow.set_nonce_from_header();
        pow.set_working_header();
        pow.hash_working_header();
        pow.fill_many_hash_1();

        // Check that the many_hash_1_data is not all zeros
        assert!(
            !pow.many_hash_1.iter().all(|&x| x == 0),
            "many_hash_1_data should not be all zeros"
        );

        // Print the result in hex
        let hex_string = hex::encode(pow.many_hash_1);
        println!("many_hash_1_data: {}", hex_string);
    }

    // async debugGetFinalHash(): Promise<FixedBuf<32>> {
    //   this.pow3.set_working_header();
    //   this.pow3.hash_working_header();
    //   this.pow3.fill_many_hash_1();
    //   this.pow3.create_m1_from_many_hash_1();
    //   this.pow3.create_m2_from_many_hash_1();
    //   this.pow3.multiply_m1_times_m2_equals_m3();
    //   this.pow3.multiply_m3_by_pi_to_get_m4();
    //   this.pow3.convert_m4_to_bytes();
    //   this.pow3.create_many_hash_2_from_m4_bytes();
    //   this.pow3.create_final_hash_from_many_hash_2();
    //   const arr = this.pow3.get_final_hash();
    //   return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
    // }

    #[test]
    fn test_debug_get_final_hash() {
        let header = create_test_header();
        let mut pow = Pow3::new(header).unwrap();
        pow.set_nonce_from_header();
        pow.set_working_header();
        pow.hash_working_header();
        pow.fill_many_hash_1();
        pow.create_m1_from_many_hash_1();
        pow.create_m2_from_many_hash_1();
        pow.multiply_m1_times_m2_equals_m3();
        pow.multiply_m3_by_pi_to_get_m4();
        pow.convert_m4_to_bytes();
        pow.create_many_hash_2_from_m4_bytes();
        pow.create_final_hash_from_many_hash_2();

        // Check that the final_hash is not all zeros
        assert!(
            !pow.final_hash.iter().all(|&x| x == 0),
            "final_hash should not be all zeros"
        );

        // Print the result in hex
        let hex_string = hex::encode(pow.final_hash);
        println!("final_hash: {}", hex_string);
    }
}
