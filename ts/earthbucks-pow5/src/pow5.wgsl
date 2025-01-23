// pow5 constants
const HEADER_SIZE: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: u32 = 32;
const FINAL_PRE_HASH_SIZE: u32 = 32 * 4;
const COMPRESSED_HASH_SIZE: u32 = 32 / 4; // 8
const WORKGROUP_SIZE: u32 = 256;
const MAX_GRID_SIZE: u32 = 32768; // max size
const WORK_PAR_START: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2;
const WORK_PAR_END: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32;

struct Pow5Result {
    nonce: u32,
    hash: array<u32, COMPRESSED_HASH_SIZE>,
};

// input
@group(0) @binding(0) var<storage, read> header: array<u32, HEADER_SIZE>;
@group(0) @binding(1) var<storage, read> grid_size: u32;

// output
var<workgroup> workgroup_results: array<Pow5Result, WORKGROUP_SIZE>;
@group(0) @binding(2) var<storage, read_write> grid_results: array<Pow5Result, MAX_GRID_SIZE>;
@group(0) @binding(3) var<storage, read_write> final_result: Pow5Result;

// blake3 constants
const OUT_LEN: u32 = 32;
const BLOCK_LEN: u32 = 64;

const CHUNK_SIZE: u32 = 1024;
const CHUNK_START: u32 = 1 ;
const CHUNK_END: u32 = 2;
const ROOT: u32 = 8;

const global_IV = array<u32, 8>(
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19,
);

const MSG_PERMUTATION = array<u32, 16>(
    2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8,
);

fn g(state_ptr: ptr<function, array<u32, 16>>, a: u32, b: u32, c: u32, d: u32, mx: u32, my: u32) {
    (*state_ptr)[a] = (*state_ptr)[a] + (*state_ptr)[b] + mx;
    (*state_ptr)[d] = (((*state_ptr)[d] ^ (*state_ptr)[a]) >> 16u) | (((*state_ptr)[d] ^ (*state_ptr)[a]) << 16u);
    (*state_ptr)[c] = (*state_ptr)[c] + (*state_ptr)[d];
    (*state_ptr)[b] = (((*state_ptr)[b] ^ (*state_ptr)[c]) >> 12u) | (((*state_ptr)[b] ^ (*state_ptr)[c]) << 20u);
    (*state_ptr)[a] = (*state_ptr)[a] + (*state_ptr)[b] + my;
    (*state_ptr)[d] = (((*state_ptr)[d] ^ (*state_ptr)[a]) >> 8u) | (((*state_ptr)[d] ^ (*state_ptr)[a]) << 24u);
    (*state_ptr)[c] = (*state_ptr)[c] + (*state_ptr)[d];
    (*state_ptr)[b] = (((*state_ptr)[b] ^ (*state_ptr)[c]) >> 7u) | (((*state_ptr)[b] ^ (*state_ptr)[c]) << 25u);
}

fn round(state_ptr: ptr<function, array<u32, 16>>, m_ptr: ptr<function, array<u32, 16>>) {
    // Mix the columns.
    g(state_ptr, 0u, 4u, 8u, 12u, (*m_ptr)[0], (*m_ptr)[1]);
    g(state_ptr, 1u, 5u, 9u, 13u, (*m_ptr)[2], (*m_ptr)[3]);
    g(state_ptr, 2u, 6u, 10u, 14u, (*m_ptr)[4], (*m_ptr)[5]);
    g(state_ptr, 3u, 7u, 11u, 15u, (*m_ptr)[6], (*m_ptr)[7]);
    // Mix the diagonals.
    g(state_ptr, 0u, 5u, 10u, 15u, (*m_ptr)[8], (*m_ptr)[9]);
    g(state_ptr, 1u, 6u, 11u, 12u, (*m_ptr)[10], (*m_ptr)[11]);
    g(state_ptr, 2u, 7u, 8u, 13u, (*m_ptr)[12], (*m_ptr)[13]);
    g(state_ptr, 3u, 4u, 9u, 14u, (*m_ptr)[14], (*m_ptr)[15]);
}

fn permute(m_ptr: ptr<function, array<u32, 16>>) {
    var permuted: array<u32, 16>;
    for (var i: u32 = 0u; i < 16u; i++) {
        var index: u32 = MSG_PERMUTATION[i];
        permuted[i] = (*m_ptr)[index];
    }

    for (var i: u32 = 0u; i < 16u; i++) {
        (*m_ptr)[i] = permuted[i];
    }
}

fn compress(
    chaining_value_ptr: ptr<function, array<u32, 8>>,
    block_words_ptr: ptr<function, array<u32, 16>>,
    block_len: u32,
    flags: u32,
) -> array<u32, 16> {
    var IV: array<u32, 8>;
    for (var i: u32 = 0u; i < 8u; i++) {
        IV[i] = global_IV[i];
    }
    let counter_low: u32 = 0u;
    let counter_high: u32 = 0u;
    var state: array<u32, 16> = array<u32, 16>(
        (*chaining_value_ptr)[0], (*chaining_value_ptr)[1], (*chaining_value_ptr)[2], (*chaining_value_ptr)[3],
        (*chaining_value_ptr)[4], (*chaining_value_ptr)[5], (*chaining_value_ptr)[6], (*chaining_value_ptr)[7],
        IV[0], IV[1], IV[2], IV[3],
        counter_low, counter_high, block_len, flags,
    );
    var block: array<u32, 16> = *block_words_ptr;


    round(&state, &block); // round 1
    permute(&block);
    round(&state, &block); // round 2
    permute(&block);
    round(&state, &block); // round 3
    permute(&block);
    round(&state, &block); // round 4
    permute(&block);
    round(&state, &block); // round 5
    permute(&block);
    round(&state, &block); // round 6
    permute(&block);
    round(&state, &block); // round 7

    for (var i: u32 = 0u; i < 8u; i++) {
        state[i] = state[i] ^ state[i + 8u];
        state[i + 8u] = state[i + 8u] ^ (*chaining_value_ptr)[i];
    }
    return state;
}

fn first_8_words(compression_output: array<u32, 16>) -> array<u32, 8> {
    var result: array<u32, 8>;
    for (var i: u32 = 0u; i < 8u; i++) {
        result[i] = compression_output[i];
    }
    return result;
}

fn words_from_little_endian_bytes(bytes_ptr: ptr<function, array<u32, 64>>, words_ptr: ptr<function, array<u32, 16>>) {
    let WORDS_LEN: u32 = 16u;
    for (var i: u32 = 0u; i < WORDS_LEN; i++) {
        let four_bytes: array<u32, 4> = array<u32, 4>(
            (*bytes_ptr)[i * 4u],
            (*bytes_ptr)[i * 4u + 1u],
            (*bytes_ptr)[i * 4u + 2u],
            (*bytes_ptr)[i * 4u + 3u],
        );
        (*words_ptr)[i] = four_bytes[0] | (four_bytes[1] << 8u) | (four_bytes[2] << 16u) | (four_bytes[3] << 24u);
    }
}

fn min(a: u32, b: u32) -> u32 {
    if a < b {
        return a;
    } else {
        return b;
    }
}

struct Output {
    input_chaining_value: array<u32, 8>,
    block_words: array<u32, 16>,
    block_len: u32,
    flags: u32,
}

fn root_output_bytes(output_ptr: ptr<function, Output>, out_slice_ptr: ptr<function, array<u32, 32>>) {
    let OUT_BLOCK_SIZE: u32 = 2u * 32u; // 2 * OUT_LEN
    let WORD_SIZE: u32 = 4u;
    let OUT_SLICE_SIZE: u32 = 32u;
    let num_out_blocks: u32 = (OUT_SLICE_SIZE + OUT_BLOCK_SIZE - 1u) / OUT_BLOCK_SIZE;

    for (var out_block_index: u32 = 0u; out_block_index < num_out_blocks; out_block_index++) {
        let out_block_start: u32 = out_block_index * OUT_BLOCK_SIZE;
        let out_block_end: u32 = min(out_block_start + OUT_BLOCK_SIZE, OUT_SLICE_SIZE);

        var words: array<u32, 16> = compress(
            &(*output_ptr).input_chaining_value,
            &(*output_ptr).block_words,
            (*output_ptr).block_len,
            (*output_ptr).flags | ROOT,
        );

        let num_out_words: u32 = (out_block_end - out_block_start + WORD_SIZE - 1u) / WORD_SIZE;

        for (var word_index: u32 = 0u; word_index < num_out_words; word_index++) {
            let out_word_start: u32 = out_block_start + word_index * WORD_SIZE;
            let out_word_end: u32 = min(out_word_start + WORD_SIZE, out_block_end);

            let word: u32 = words[word_index];

            for (var i: u32 = 0u; i < (out_word_end - out_word_start); i++) {
                let byte_index: u32 = out_word_start + i;
                (*out_slice_ptr)[byte_index] = (word >> (i * 8u));
            }
        }
    }
}

// note: this implementation of blake3 does not work for lengths of 256 bytes
// or longer, for reasons having to do with the hacky way we translated u8
// values to u32 values. it would need to be rewritten to work for lengths of
// 256 bytes or longer.
fn blake3_hash_217(
    input_ptr: ptr<function, array<u32, 217>>,
) -> array<u32, 32> {
    let input_len: u32 = 217u;

    var chaining_value: array<u32, 8>;
    for (var i: u32 = 0u; i < 8u; i++) {
        chaining_value[i] = global_IV[i];
    }
    var block: array<u32, 64>;
    var block_len: u32 = 0u;
    var blocks_compressed: u32 = 0u;

    var remaining_input_len: u32 = input_len;
    var remaining_input_ptr: u32 = 0u;

    while remaining_input_len > 0u {
        var start_flag: u32 = 0u;
        if blocks_compressed == 0u {
            start_flag = CHUNK_START;
        }

        if block_len == 64u {
            var block_words: array<u32, 16>;
            words_from_little_endian_bytes(&block, &block_words);
            chaining_value = first_8_words(compress(
                &chaining_value,
                &block_words,
                64u,
                start_flag,
            ));
            blocks_compressed = blocks_compressed + 1u;
            block = array<u32,64>();
            block_len = 0u;
        }

        let take: u32 = min(64u - block_len, remaining_input_len);
        for (var i: u32 = 0u; i < take; i++) {
            block[block_len + i] = (*input_ptr)[remaining_input_ptr + i];
        }
        block_len = block_len + take;
        remaining_input_ptr = remaining_input_ptr + take;
        remaining_input_len = remaining_input_len - take;
    }

    var block_words: array<u32, 16>;
    words_from_little_endian_bytes(&block, &block_words);

    var start_flag: u32 = 0u;
    if blocks_compressed == 0u {
        start_flag = CHUNK_START;
    }
    var output: Output = Output(
        chaining_value,
        block_words,
        block_len,
        start_flag | CHUNK_END,
    );

    var hash_output: array<u32, 32>;
    root_output_bytes(&output, &hash_output);
    for (var i: u32 = 0u; i < 32u; i++) {
        hash_output[i] = hash_output[i] & 0xff;
    }
    return hash_output;
}

fn blake3_hash_128(
    input_ptr: ptr<function, array<u32, 128>>,
) -> array<u32, 32> {
    let input_len: u32 = 128u;

    var chaining_value: array<u32, 8>;
    for (var i: u32 = 0u; i < 8u; i++) {
        chaining_value[i] = global_IV[i];
    }
    var block: array<u32, 64>;
    var block_len: u32 = 0u;
    var blocks_compressed: u32 = 0u;

    var remaining_input_len: u32 = input_len;
    var remaining_input_ptr: u32 = 0u;

    while remaining_input_len > 0u {
        var start_flag: u32 = 0u;
        if blocks_compressed == 0u {
            start_flag = CHUNK_START;
        }

        if block_len == 64u {
            var block_words: array<u32, 16>;
            words_from_little_endian_bytes(&block, &block_words);
            chaining_value = first_8_words(compress(
                &chaining_value,
                &block_words,
                64u,
                start_flag,
            ));
            blocks_compressed = blocks_compressed + 1u;
            block = array<u32,64>();
            block_len = 0u;
        }

        let take: u32 = min(64u - block_len, remaining_input_len);
        for (var i: u32 = 0u; i < take; i++) {
            block[block_len + i] = (*input_ptr)[remaining_input_ptr + i];
        }
        block_len = block_len + take;
        remaining_input_ptr = remaining_input_ptr + take;
        remaining_input_len = remaining_input_len - take;
    }

    var block_words: array<u32, 16>;
    words_from_little_endian_bytes(&block, &block_words);

    var start_flag: u32 = 0u;
    if blocks_compressed == 0u {
        start_flag = CHUNK_START;
    }
    var output: Output = Output(
        chaining_value,
        block_words,
        block_len,
        start_flag | CHUNK_END,
    );

    var hash_output: array<u32, 32>;
    root_output_bytes(&output, &hash_output);
    for (var i: u32 = 0u; i < 32u; i++) {
        hash_output[i] = hash_output[i] & 0xff;
    }
    return hash_output;
}

fn blake3_hash_32(
    input_ptr: ptr<function, array<u32, 32>>,
) -> array<u32, 32> {
    let input_len: u32 = 32u;

    var chaining_value: array<u32, 8>;
    for (var i: u32 = 0u; i < 8u; i++) {
        chaining_value[i] = global_IV[i];
    }
    var block: array<u32, 64>;
    var block_len: u32 = 0u;
    var blocks_compressed: u32 = 0u;

    var remaining_input_len: u32 = input_len;
    var remaining_input_ptr: u32 = 0u;

    while remaining_input_len > 0u {
        var start_flag: u32 = 0u;
        if blocks_compressed == 0u {
            start_flag = CHUNK_START;
        }

        if block_len == 64u {
            var block_words: array<u32, 16>;
            words_from_little_endian_bytes(&block, &block_words);
            chaining_value = first_8_words(compress(
                &chaining_value,
                &block_words,
                64u,
                start_flag,
            ));
            blocks_compressed = blocks_compressed + 1u;
            block = array<u32,64>();
            block_len = 0u;
        }

        let take: u32 = min(64u - block_len, remaining_input_len);
        for (var i: u32 = 0u; i < take; i++) {
            block[block_len + i] = (*input_ptr)[remaining_input_ptr + i];
        }
        block_len = block_len + take;
        remaining_input_ptr = remaining_input_ptr + take;
        remaining_input_len = remaining_input_len - take;
    }

    var block_words: array<u32, 16>;
    words_from_little_endian_bytes(&block, &block_words);

    var start_flag: u32 = 0u;
    if blocks_compressed == 0u {
        start_flag = CHUNK_START;
    }
    var output: Output = Output(
        chaining_value,
        block_words,
        block_len,
        start_flag | CHUNK_END,
    );

    var hash_output: array<u32, 32>;
    root_output_bytes(&output, &hash_output);
    for (var i: u32 = 0u; i < 32u; i++) {
        hash_output[i] = hash_output[i] & 0xff;
    }
    return hash_output;
}

// this method is just for debugging purposes. all we do is hash the header
// with blake3 and store the result in the hash_result array.
@compute @workgroup_size(1, 1, 1)
fn debug_hash_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, 32> = blake3_hash_217(&local_header);

    var compressed_result: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_result[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_result[j] += (hash_result[i] & 0xff) << (k * 8);
    }

    // now we need to store the hash result in the final_result array
    if global_id.x == 0 {
        for (var i: u32 = 0; i < 32; i++) {
            final_result.hash[i] = compressed_result[i];
        }
    }
}

// this method is just for debugging purposes. all we do is hash the header
// with blake3, and then hash it again, and store the result in the hash_result
// array.
@compute @workgroup_size(1, 1, 1)
fn debug_double_hash_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, 32> = blake3_hash_217(&local_header);
    hash_result = blake3_hash_32(&hash_result);

    var compressed_result: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_result[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_result[j] += (hash_result[i] & 0xff) << (k * 8);
    }

    // now we need to store the hash result in the final_result array
    if global_id.x == 0 {
        for (var i: u32 = 0; i < 32; i++) {
            final_result.hash[i] = compressed_result[i];
        }
    }
}

// this method is just for debugging purposes. all we do is hash the first 128
// bytes of the header with blake3 and store the result in the hash_result
// array.
@compute @workgroup_size(1, 1, 1)
fn debug_hash_header_128(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, 128>;
    for (var i: u32 = 0; i < 128; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, 32> = blake3_hash_128(&local_header);

    var compressed_result: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_result[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_result[j] += (hash_result[i] & 0xff) << (k * 8);
    }

    // now we need to store the hash result in the final_result array
    if global_id.x == 0 {
        for (var i: u32 = 0; i < 32; i++) {
            final_result.hash[i] = compressed_result[i];
        }
    }
}

// this method is just for debugging purposes. all we do is hash the first 32
// bytes of the header with blake3 and store the result in the hash_result
// array.
@compute @workgroup_size(1, 1, 1)
fn debug_hash_header_32(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, 32>;
    for (var i: u32 = 0; i < 32; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, 32> = blake3_hash_32(&local_header);

    var compressed_result: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_result[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_result[j] += (hash_result[i] & 0xff) << (k * 8);
    }

    // now we need to store the hash result in the final_result array
    if global_id.x == 0 {
        for (var i: u32 = 0; i < 32; i++) {
            final_result.hash[i] = compressed_result[i];
        }
    }
}

fn get_work_par(header: array<u32, HEADER_SIZE>) -> array<u32, HASH_SIZE> {
    var header_clone: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        header_clone[i] = header[i];
    }
    // first, hash the header
    var matrix_A_row_1: array<u32, HASH_SIZE> = blake3_hash_217(&header_clone);
    
    // next, we will do the following. we will hash this hash over and over, 32
    // times. we will then multiply and add (similar to matmul) each value of
    // matrix_A_row_1 against each value of the new columns, of which there are
    // 32. these values will go into the final hash.
    var matrix_B_working_column: array<u32, HASH_SIZE>;
    for (var i: u32 = 0; i < 32; i++) {
        matrix_B_working_column[i] = matrix_A_row_1[i];
    }
    var matrix_C_row_1: array<u32, HASH_SIZE>;
    for (var i: u32 = 0; i < 32; i++) {
        matrix_C_row_1[i] = 0;
    }
    for (var i: u32 = 0; i < 32; i++) {
        // now, hash the working column to get a new matrix_B_working_column
        var new_column: array<u32, HASH_SIZE> = blake3_hash_32(&matrix_B_working_column);
        for (var j: u32 = 0; j < 32; j++) {
            matrix_B_working_column[j] = new_column[j];
        }

        // the working column has been updated. now we "multiply and add" it
        // against the header hash.
        for (var j: u32 = 0; j < 32; j++) {
            matrix_C_row_1[i] += matrix_A_row_1[j] * matrix_B_working_column[j];
        }
    }

    // now, matrix_C_row_1 is the first row of the matrix C. it is an array of
    // uint32 that may have any value. we need to expand this by a factor of 4,
    // where each uint32 is expanded to 4 uint32 in *big endian*. that is so
    // that each resulting "byte" is in the range 0 to 255.
    var final_pre_hash: array<u32, FINAL_PRE_HASH_SIZE>;
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i * 4;
        final_pre_hash[j] = (matrix_C_row_1[i] >> 24) & 0xff;
        final_pre_hash[j + 1] = (matrix_C_row_1[i] >> 16) & 0xff;
        final_pre_hash[j + 2] = (matrix_C_row_1[i] >> 8) & 0xff;
        final_pre_hash[j + 3] = matrix_C_row_1[i] & 0xff;
    }

    // we have now produced the first row of a matrix C via a matmul-esque
    // operation. we will now hash this row to get the work_par
    var work_par: array<u32, HASH_SIZE> = blake3_hash_128(&final_pre_hash);

    return work_par;
}

// this method is just for debugging purposes. all we do is get the work_par
// from the header and store the result in the hash_result array.
@compute @workgroup_size(1, 1, 1)
fn debug_get_work_par(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var work_par: array<u32, HASH_SIZE> = get_work_par(header);
//    // now we need to store the work_par in the final_result array
//    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
//        final_result.hash[i] = work_par[i];
//    }

    // now we need to compress the work_par (which is a hash)
    var compressed_work_par: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_work_par[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_work_par[j] += (work_par[i] & 0xff) << (k * 8);
    }

    // now we need to store the work_par in the final_result array
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        final_result.hash[i] = compressed_work_par[i];
    }
}

fn elementary_iteration(header: array<u32, HEADER_SIZE>) -> array<u32, COMPRESSED_HASH_SIZE> {
    var work_par: array<u32, HASH_SIZE> = get_work_par(header);

    // now we need to set the work_par inside the header
    var working_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        working_header[i] = header[i];
    }
    for (var i: u32 = WORK_PAR_START; i < WORK_PAR_END; i++) {
        working_header[i] = work_par[i - WORK_PAR_START];
    }

    // now we heed to hash the header
    var hash_1: array<u32, 32> = blake3_hash_217(&working_header);

    // now we need to hash it again because the id of the header is the double blake3 hash
    var hash_2: array<u32, 32> = blake3_hash_32(&hash_1);

    // now, we need to produce the compressed hash. because wgsl has no notion
    // of a u8, the hash is 32 u32 values that each range from 0 to 255. we can
    // compress this by taking only the least significant value of each "u32
    // byte". we put them in big-endian order.
    var compressed_hash: array<u32, COMPRESSED_HASH_SIZE>;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        compressed_hash[i] = 0;
    }
    for (var i: u32 = 0; i < HASH_SIZE; i++) {
        var j: u32 = i / 4;
        var k: u32 = 3 - (i % 4);
        compressed_hash[j] += (hash_2[i] & 0xff) << (k * 8);
    }

    return compressed_hash;
}

@compute @workgroup_size(1, 1, 1)
fn debug_elementary_iteration(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, COMPRESSED_HASH_SIZE>;
    hash_result = elementary_iteration(local_header);

    // now we need to store the hash result in the final_result array
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        final_result.hash[i] = hash_result[i];
    }
}

@compute @workgroup_size(WORKGROUP_SIZE, 1, 1)
fn workgroup_reduce(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let global_thread_id: u32 = global_id.x + global_id.y * WORKGROUP_SIZE + global_id.z * WORKGROUP_SIZE * WORKGROUP_SIZE;
    let workgroup_id: u32 = global_thread_id / WORKGROUP_SIZE; // each workgroup has a unique id
    let local_thread_id: u32 = global_thread_id % WORKGROUP_SIZE; // each thread has an id unique to the workgroup

    // first, copy the header from global memory into local memory
    var local_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        local_header[i] = header[i];
    }

    // next, our goal is to iterate over the nonce range for this workgroup. we
    // don't care what the nonce is currently in the header. we're going to use
    // the global_thread_id as the nonce. if there is one workgroup, it ranges from 0
    // to WORKGROUP_SIZE. however, there can be more than one workgroup. thus,
    // it can be up to WORKGROUP_SIZE * MAX_GRID_SIZE.
    var nonce: u32 = global_thread_id;

    // now we have to update the nonce in the header. we do this in *big endian*
    local_header[NONCE_START] = (nonce >> 24) & 0xff; // Most significant byte first
    local_header[NONCE_START + 1] = (nonce >> 16) & 0xff; // Third least significant byte
    local_header[NONCE_START + 2] = (nonce >> 8) & 0xff; // Second least significant byte
    local_header[NONCE_START + 3] = nonce & 0xff; // Least significant byte last

    // now each workgroup will need to run the elementary iteration. then we store the result
    // in the shared memory workgroup_results array.
    var result: Pow5Result;
    result.nonce = nonce;
    var result_hash: array<u32, COMPRESSED_HASH_SIZE> = elementary_iteration(local_header);
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        result.hash[i] = result_hash[i];
    }

    // now we need to store the result in the workgroup_results array
    workgroup_results[local_thread_id].nonce = result.nonce;
    for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        workgroup_results[local_thread_id].hash[i] = result.hash[i];
    }

    // now we must wait for all results to finish before proceeding.
    workgroupBarrier();

    // now we need to "reduce" the results by finding the *lowest* hash in the
    // workgroup (for each workgroup). note that the hashes are *big endian*.
    // looking at the first byte only would be adequate most of the time, but
    // we want to handle all cases, so we look at all bytes if necessary. which
    // ever is the lowest hash for this workgroup gets stored in the
    // grid_results array, at the position of this workgroup. only the first
    // thread in the workgroup will do this.
    if local_thread_id == 0 {
        var lowest_hash: array<u32, COMPRESSED_HASH_SIZE>;
        for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
            lowest_hash[i] = 0xffffffff;
        }
        for (var i: u32 = 0; i < WORKGROUP_SIZE; i++) {
            var current_hash: array<u32, COMPRESSED_HASH_SIZE>;
            for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                current_hash[j] = workgroup_results[i].hash[j];
            }
            var is_current_hash_lower: bool = false;
            for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                if current_hash[j] < lowest_hash[j] {
                    is_current_hash_lower = true;
                    break;
                } else if current_hash[j] > lowest_hash[j] {
                    break;
                }
            }
            if is_current_hash_lower {
                for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                    lowest_hash[j] = current_hash[j];
                }
                grid_results[workgroup_id].nonce = workgroup_results[i].nonce;
                for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                    grid_results[workgroup_id].hash[j] = lowest_hash[j];
                }
            }
        }
        //// debug: set grid hash to all 1s
        //for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
        //    grid_results[workgroup_id].hash[i] = 0xffffffff;
        //}
    }

    // we can't use workgroupBarrier() here because we used a conditional on
    // the thread id so we need to wait for all threads to finish before we can
    // continue. a separate method is used to determine "global" results.
}

@compute @workgroup_size(1, 1, 1)
fn grid_reduce(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let global_thread_id: u32 = global_id.x + global_id.y * 1 + global_id.z * 1 * 1;

    // we need to find the lowest hash in the grid_results array. we will store
    // this in the final_result array. we only do this once for the entire
    // grid. this is the final reduction.
    if global_thread_id == 0 {
        var lowest_hash: array<u32, COMPRESSED_HASH_SIZE>;
        for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
            lowest_hash[i] = 0xffffffff;
        }
        for (var i: u32 = 0; i < grid_size; i++) {
            var current_hash: array<u32, COMPRESSED_HASH_SIZE>;
            for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                current_hash[j] = grid_results[i].hash[j];
            }
            var is_current_hash_lower: bool = false;
            for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                if current_hash[j] < lowest_hash[j] {
                    is_current_hash_lower = true;
                    break;
                } else if current_hash[j] > lowest_hash[j] {
                    break;
                }
            }
            if is_current_hash_lower {
                for (var j: u32 = 0; j < COMPRESSED_HASH_SIZE; j++) {
                    lowest_hash[j] = current_hash[j];
                }
                final_result.nonce = grid_results[i].nonce;
            }
        }
        for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
            final_result.hash[i] = lowest_hash[i];
        }
//    // debug: set final hash to all 1s
//    if global_thread_id == 0{
//      for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
//        final_result.hash[i] = 0xffffffff;
//      }
//    }
    }
}

