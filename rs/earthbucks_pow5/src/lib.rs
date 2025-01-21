pub mod blake3_reference;
use blake3_reference::blake3_reference_hash;
use wasm_bindgen::prelude::*;

const HEADER_SIZE: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: usize = 32;
const WORK_PAR_START: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2;
const WORK_PAR_END: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32;

// what we need to do is something like the wgsl code above, with a bit of modifications because we
// are in rust instead of wgsl. in wgsl, there is no such thing as a u8. thus, the final hash has
// to be compressed. in rust, we have u8, and deal with u8 arrays. thus, there is no reason to
// "compress" the final hash. other than that, the basic logic is the same, which is as follows:
//
// - hash the heaer to get matrix_A_row_1
// - begin a loop, where we multiply and add matrix_A_row_1 against a working column, where a
//   working column is the hash of the previous working column, starting with the hash of the first
//   hash
// - after 32 iterations, we have a matrix_C_row_1, which we hash to get the final hash. this is
//   the "parallel work" or "work_par"
#[wasm_bindgen]
pub fn get_work_par(header: Vec<u8>) -> Result<Vec<u8>, String> {
    if header.len() != HEADER_SIZE {
        return Err("header is not the correct size".to_string());
    }
    // first, hash the header with blake3
    let matrix_a_row_1 = blake3_reference_hash(header.clone());

    // next, we will do the following. we will hash this hash over and over, 32
    // times. we will then multiply and add (similar to matmul) each value of
    // matrix_A_row_1 against each value of the new columns, of which there are
    // 32. these values will go into the final hash.
    let mut matrix_c_working_column = matrix_a_row_1.clone();
    let mut matrix_c_row_1 = [0u32; HASH_SIZE];
    #[allow(clippy::needless_range_loop)]
    for i in 0..32 {
        // now, hash the working column to get a new matrix_B_working_column
        matrix_c_working_column = blake3_reference_hash(matrix_c_working_column.to_vec());

        // the working column has been updated. now we "multiply and add" it
        // against the header hash.
        for j in 0..32 {
            matrix_c_row_1[i] += (matrix_a_row_1[j] as u32) * (matrix_c_working_column[j] as u32);
        }
    }

    // now we need to convert the matrix_c_row_1 to a u8 array - in *big-endian*
    // format
    let mut final_pre_hash: [u8; 32 * 4] = [0u8; 32 * 4];
    #[allow(clippy::needless_range_loop)]
    for i in 0..32 {
        let x = matrix_c_row_1[i];
        let j = i * 4;
        final_pre_hash[j] = (x >> 24) as u8;
        final_pre_hash[j + 1] = (x >> 16) as u8;
        final_pre_hash[j + 2] = (x >> 8) as u8;
        final_pre_hash[j + 3] = x as u8;
    }

    // we have now produced the first row of a matrix C via a matmul-esque operation. we will now
    // hash this row to get the "parallel work" or "work_par".
    let work_par = blake3_reference_hash(final_pre_hash.to_vec());

    Ok(work_par.to_vec())
}

#[wasm_bindgen]
pub fn elementary_iteration(header: Vec<u8>) -> Result<Vec<u8>, String> {
    if header.len() != HEADER_SIZE {
        return Err("header is not the correct size".to_string());
    }

    let work_par = get_work_par(header.clone())?;

    // now we need to insert to the work_par into the header
    let mut working_header = header.clone();
    #[allow(clippy::manual_memcpy)]
    for i in WORK_PAR_START..WORK_PAR_END {
        working_header[i] = work_par[i - WORK_PAR_START];
    }

    // now we need to hash the header
    let hash_1 = blake3_reference_hash(working_header);

    // now we need to hash it again because the "id" is actually the hash of the hash
    let hash_2 = blake3_reference_hash(hash_1);

    Ok(hash_2)
}

#[wasm_bindgen]
pub fn insert_nonce(header: Vec<u8>, nonce: u32) -> Result<Vec<u8>, String> {
    if header.len() != HEADER_SIZE {
        return Err("header is not the correct size".to_string());
    }
    let mut header = header.clone();
    header[NONCE_START..NONCE_END].copy_from_slice(&nonce.to_be_bytes());
    Ok(header)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_debug_get_work_par() {
        let expect_hex = "6fe9eddc39bb4183c44853c41876801be94a138ea9adea89f40a08442d2f79b8";
        let header_all_zeroes = vec![0; HEADER_SIZE];
        let result = get_work_par(header_all_zeroes).unwrap();
        assert_eq!(hex::encode(result), expect_hex);

        let expect_hex = "09d125453a1a5e9f75c770e3580e8b8035069b39816036b38207e8e152fa6871";
        let header_all_ones = vec![0x11; HEADER_SIZE];
        let result = get_work_par(header_all_ones).unwrap();
        assert_eq!(hex::encode(result), expect_hex);
    }

    #[test]
    fn test_debug_elementary_iteration() {
        let expect_hex = "c88f591bfa80126e9a14d76d473ca8ae7ac578ed1eac0150fcbc06742f4f7d6f";
        let header_all_zeroes = vec![0; HEADER_SIZE];
        let result = elementary_iteration(header_all_zeroes).unwrap();
        assert_eq!(hex::encode(result), expect_hex);

        let expect_hex = "a0c84664c6489150ffdd9755c5fad8fe08339d923ad2a3fda6369e1e74be9184";
        let header_all_ones = vec![0x11; HEADER_SIZE];
        let result = elementary_iteration(header_all_ones).unwrap();
        assert_eq!(hex::encode(result), expect_hex);
    }

    #[test]
    fn test_work() {
        let expect_hex = "00000004f0ac89d75f135f184abbf0a82fad1e07fb4a29adb159648d70adf474";
        let header_all_zeroes = vec![0; HEADER_SIZE];
        let header = insert_nonce(header_all_zeroes.clone(), 376413).unwrap();
        let result = elementary_iteration(header).unwrap();
        assert_eq!(hex::encode(result), expect_hex);

        let expect_hex = "0000004bd2d60b7b67702281a87b14e45c65d40465dc41fa2639ef84f050164a";
        let header_all_ones = vec![0x11; HEADER_SIZE];
        let header = insert_nonce(header_all_ones.clone(), 424378).unwrap();
        let result = elementary_iteration(header).unwrap();
        assert_eq!(hex::encode(result), expect_hex);
    }
}
