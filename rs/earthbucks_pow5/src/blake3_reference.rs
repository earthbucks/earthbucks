use wasm_bindgen::prelude::*;

const OUT_LEN: usize = 32;
const BLOCK_LEN: usize = 64;

const CHUNK_SIZE: usize = 1024;
const CHUNK_START: u32 = 1;
const CHUNK_END: u32 = 2;
const ROOT: u32 = 8;

const IV: [u32; 8] = [
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
];

const MSG_PERMUTATION: [usize; 16] = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];

// The mixing function, G, which mixes either a column or a diagonal.
fn g(state: &mut [u32; 16], a: usize, b: usize, c: usize, d: usize, mx: u32, my: u32) {
    state[a] = state[a].wrapping_add(state[b]).wrapping_add(mx);
    state[d] = (state[d] ^ state[a]).rotate_right(16);
    state[c] = state[c].wrapping_add(state[d]);
    state[b] = (state[b] ^ state[c]).rotate_right(12);
    state[a] = state[a].wrapping_add(state[b]).wrapping_add(my);
    state[d] = (state[d] ^ state[a]).rotate_right(8);
    state[c] = state[c].wrapping_add(state[d]);
    state[b] = (state[b] ^ state[c]).rotate_right(7);
}

fn round(state: &mut [u32; 16], m: &[u32; 16]) {
    // Mix the columns.
    g(state, 0, 4, 8, 12, m[0], m[1]);
    g(state, 1, 5, 9, 13, m[2], m[3]);
    g(state, 2, 6, 10, 14, m[4], m[5]);
    g(state, 3, 7, 11, 15, m[6], m[7]);
    // Mix the diagonals.
    g(state, 0, 5, 10, 15, m[8], m[9]);
    g(state, 1, 6, 11, 12, m[10], m[11]);
    g(state, 2, 7, 8, 13, m[12], m[13]);
    g(state, 3, 4, 9, 14, m[14], m[15]);
}

fn permute(m: &mut [u32; 16]) {
    let mut permuted = [0; 16];
    for i in 0..16 {
        permuted[i] = m[MSG_PERMUTATION[i]];
    }
    *m = permuted;
}

fn compress(
    chaining_value: &[u32; 8],
    block_words: &[u32; 16],
    block_len: u32,
    flags: u32,
) -> [u32; 16] {
    let counter_low: u32 = 0;
    let counter_high: u32 = 0;
    #[rustfmt::skip]
    let mut state = [
        chaining_value[0], chaining_value[1], chaining_value[2], chaining_value[3],
        chaining_value[4], chaining_value[5], chaining_value[6], chaining_value[7],
        IV[0],             IV[1],             IV[2],             IV[3],
        counter_low,       counter_high,      block_len,         flags,
    ];
    let mut block = *block_words;

    round(&mut state, &block); // round 1
    permute(&mut block);
    round(&mut state, &block); // round 2
    permute(&mut block);
    round(&mut state, &block); // round 3
    permute(&mut block);
    round(&mut state, &block); // round 4
    permute(&mut block);
    round(&mut state, &block); // round 5
    permute(&mut block);
    round(&mut state, &block); // round 6
    permute(&mut block);
    round(&mut state, &block); // round 7

    for i in 0..8 {
        state[i] ^= state[i + 8];
        state[i + 8] ^= chaining_value[i];
    }
    state
}

fn first_8_words(compression_output: [u32; 16]) -> [u32; 8] {
    compression_output[0..8].try_into().unwrap()
}

fn words_from_little_endian_bytes(bytes: &[u32], words: &mut [u32]) {
    const WORDS_LEN: usize = 16;
    debug_assert_eq!(BLOCK_LEN, 4 * WORDS_LEN);
    for i in 0..WORDS_LEN {
        let four_bytes: [u32; 4] = [
            bytes[i * 4],
            bytes[i * 4 + 1],
            bytes[i * 4 + 2],
            bytes[i * 4 + 3],
        ];
        words[i] = (four_bytes[0])
            | ((four_bytes[1]) << 8)
            | ((four_bytes[2]) << 16)
            | ((four_bytes[3]) << 24);
    }
}

fn min(a: usize, b: usize) -> usize {
    if a < b {
        a
    } else {
        b
    }
}

// Each chunk or parent node can produce either an 8-word chaining value or, by
// setting the ROOT flag, any number of final output bytes. The Output struct
// captures the state just prior to choosing between those two possibilities.
struct Output {
    input_chaining_value: [u32; 8],
    block_words: [u32; 16],
    block_len: u32,
    flags: u32,
}

fn root_output_bytes(output: &Output, out_slice: &mut [u32]) {
    const OUT_BLOCK_SIZE: usize = 2 * OUT_LEN;
    const WORD_SIZE: usize = 4;
    const OUT_SLICE_SIZE: usize = 32;
    #[allow(clippy::manual_div_ceil)]
    let num_out_blocks = (OUT_SLICE_SIZE + OUT_BLOCK_SIZE - 1) / OUT_BLOCK_SIZE;

    for out_block_index in 0..num_out_blocks {
        let out_block_start = out_block_index * OUT_BLOCK_SIZE;
        let out_block_end = min(out_block_start + OUT_BLOCK_SIZE, OUT_SLICE_SIZE);

        let words = compress(
            &output.input_chaining_value,
            &output.block_words,
            output.block_len,
            output.flags | ROOT,
        );

        #[allow(clippy::manual_div_ceil)]
        let num_out_words = (out_block_end - out_block_start + WORD_SIZE - 1) / WORD_SIZE;

        #[allow(clippy::needless_range_loop)]
        for word_index in 0..num_out_words {
            let out_word_start = out_block_start + word_index * WORD_SIZE;
            let out_word_end = min(out_word_start + WORD_SIZE, out_block_end);

            let word = words[word_index];

            for i in 0..(out_word_end - out_word_start) {
                let byte_index = out_word_start + i;
                out_slice[byte_index] = word >> (i * 8);
            }
        }
    }
}

fn blake3_hash_internal(
    input: &[u32],
    input_len: usize,
    key_words: [u32; 8],
    flags: u32,
) -> [u32; 32] {
    let mut chaining_value = key_words;
    let mut block: [u32; BLOCK_LEN] = [0; BLOCK_LEN];
    let mut block_len: u32 = 0;
    let mut blocks_compressed: u32 = 0;

    let mut remaining_input_len = input_len;
    let mut remaining_input_ptr = 0;

    while remaining_input_len > 0 {
        let start_flag = if blocks_compressed == 0 {
            CHUNK_START
        } else {
            0
        };
        if block_len as usize == BLOCK_LEN {
            let mut block_words = [0; 16];
            words_from_little_endian_bytes(&block, &mut block_words);
            chaining_value = first_8_words(compress(
                &chaining_value,
                &block_words,
                BLOCK_LEN as u32,
                flags | start_flag,
            ));
            blocks_compressed += 1;
            block = [0; BLOCK_LEN];
            block_len = 0;
        }

        let take = min(BLOCK_LEN - block_len as usize, remaining_input_len);
        for i in 0..take {
            block[block_len as usize + i] = input[remaining_input_ptr + i];
        }
        block_len += take as u32;
        remaining_input_ptr += take;
        remaining_input_len -= take;
    }

    let mut block_words = [0; 16];
    words_from_little_endian_bytes(&block, &mut block_words);

    let start_flag = if blocks_compressed == 0 {
        CHUNK_START
    } else {
        0
    };
    let output = Output {
        input_chaining_value: chaining_value,
        block_words,
        block_len,
        flags: flags | start_flag | CHUNK_END,
    };

    let mut hash_output = [0u32; 32];
    root_output_bytes(&output, &mut hash_output);
    hash_output
}

#[wasm_bindgen]
pub fn blake3_reference_hash(input: Vec<u8>) -> Vec<u8> {
    if input.len() > CHUNK_SIZE {
        panic!("input length must be less than or equal to 1024 bytes");
    }
    // for wgsl compatibility, the blake3_hash_internal function expects a u32 array, not a u8
    // arrays. thus, we need to convert the input to a u32 array.
    let mut input_u32 = [0u32; CHUNK_SIZE / 4];
    for i in 0..input.len() {
        input_u32[i] = input[i] as u32;
    }
    let arr_u32 = blake3_hash_internal(&input_u32, input.len(), IV, 0);
    // for wgsl compatibility, the above function returns a u32 array. but they are mostly empty.
    // only the least significant byte is a value. thus, we need to convert this to a u8 array,
    // ignoreing the first 3 most significant bytes of each u32.
    let mut output = Vec::new();
    #[allow(clippy::needless_range_loop)]
    for i in 0..arr_u32.len() {
        output.push((arr_u32[i] & 0xFF) as u8);
    }
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    // test blake3_hash against library blake3 implementation
    #[test]
    fn test_blake3_hash_against_library() {
        use blake3::Hasher as LibraryBlake3Hasher;
        let inputs = [
            hex::decode("").unwrap(),
            hex::decode("61").unwrap(),
            hex::decode("616263").unwrap(),
            hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f").unwrap(),
            hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f").unwrap(),
            hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f").unwrap(),
            hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f").unwrap(),
            // hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f").unwrap(),
            // hex::decode("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e").unwrap(),
        ];

        for input in inputs.iter() {
            let vec_input = input.to_vec();
            let hash_output = blake3_reference_hash(vec_input.clone());

            let mut hasher = LibraryBlake3Hasher::new();
            hasher.update(&vec_input);
            let expected_output = hasher.finalize().as_bytes().to_vec();
            let output_hex = hex::encode(hash_output);
            let expected_hex = hex::encode(expected_output);
            assert_eq!(output_hex, expected_hex);
        }
    }
}
