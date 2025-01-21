use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

const HEADER_SIZE: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: usize = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: usize = 32;

// what we need to do is something like the wgsl code above, with a bit of modifications because we
// are in rust instead of wgsl. in wgsl, there is no such thing as a u8. thus, the final hash has
// to be compressed. in rust, we have u8, and deal with u8 arrays. thus, there is no reason to
// "compress" the final hash. other than that, the basic logic is the same, which is as follows:
//
// - hash the heaer to get matrix_A_row_1
// - begin a loop, where we multiply and add matrix_A_row_1 against a working column, where a
//   working column is the hash of the previous working column, starting with the hash of the first
//   hash
// - after 32 iterations, we have a matrix_C_row_1, which we hash to get the final hash
#[wasm_bindgen]
pub fn get_header_hash(header: Vec<u8>) -> Result<Vec<u8>, String> {
    if header.len() != HEADER_SIZE {
        return Err("header is not the correct size".to_string());
    }
    // first, hash the header
    let mut hasher = Sha256::new();
    hasher.update(&header);
    let matrix_a_row_1 = hasher.finalize();

    // next, we will do the following. we will hash this hash over and over, 32
    // times. we will then multiply and add (similar to matmul) each value of
    // matrix_A_row_1 against each value of the new columns, of which there are
    // 32. these values will go into the final hash.
    let mut matrix_c_working_column = matrix_a_row_1;
    let mut matrix_c_row_1 = [0u32; HASH_SIZE];
    #[allow(clippy::needless_range_loop)]
    for i in 0..32 {
        // now, hash the working column to get a new matrix_B_working_column
        let new_column = Sha256::digest(matrix_c_working_column);
        matrix_c_working_column.copy_from_slice(&new_column);

        // the working column has been updated. now we "multiply and add" it
        // against the header hash.
        for j in 0..32 {
            matrix_c_row_1[i] += (matrix_a_row_1[j] as u32) * (matrix_c_working_column[j] as u32);
        }
    }

    // now we need to convert the matrix_c_row_1 to a u8 array - in *big-endian*
    // format
    let matrix_c_row_1: [u8; 32 * 4] = matrix_c_row_1
        .iter()
        .flat_map(|&x| x.to_be_bytes())
        .collect::<Vec<u8>>()
        .try_into()
        .unwrap();

    // we have now produced the first row of a matrix C via a matmul-esque
    // operation. we will now hash this row to get the uncompressed hash.
    let uncompressed_hash = Sha256::digest(matrix_c_row_1);

    // now, in rust, there is no need to compress the hash. we can just return
    // the uncompressed hash.
    Ok(uncompressed_hash.to_vec())
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
    fn test_debug_elementary_iteration() {
        let expect_hex = "093265b1e3a766f100b93ac525e6dff0d51dfee6991c208410849503edb51854";
        let header_all_zeroes = vec![0; HEADER_SIZE];
        // let header = insert_nonce(header_all_zeroes.clone(), 0).unwrap();
        let result = get_header_hash(header_all_zeroes).unwrap();
        assert_eq!(hex::encode(result), expect_hex);

        let expect_hex = "97fb760dec4b37f939d934ea9c1132a1b9388ea57c324a566ba07c37823fdb8a";
        let header_all_ones = vec![0x11; HEADER_SIZE];
        // let header = insert_nonce(header_all_ones.clone(), 0).unwrap();
        let result = get_header_hash(header_all_ones).unwrap();
        assert_eq!(hex::encode(result), expect_hex);
    }

    #[test]
    fn test_work() {
        let expect_hex = "000007e386f5d9a163e8e396579d16f2054362077f27ad13fe3a2e13d021ffdb";
        let header_all_zeroes = vec![0; HEADER_SIZE];
        let header = insert_nonce(header_all_zeroes.clone(), 3429530).unwrap();
        let result = get_header_hash(header).unwrap();
        assert_eq!(hex::encode(result), expect_hex);

        let expect_hex = "00000198bb5e6ae3b3e8e2a2f083dd9438fadac4a60c1dec7408b5f7f2bcc121";
        let header_all_ones = vec![0x11; HEADER_SIZE];
        let header = insert_nonce(header_all_ones.clone(), 3086284).unwrap();
        let result = get_header_hash(header).unwrap();
        assert_eq!(hex::encode(result), expect_hex);
    }
}
