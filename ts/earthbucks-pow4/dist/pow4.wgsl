const HEADER_SIZE: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: u32 = 32;
const FINAL_PRE_HASH_SIZE: u32 = 32 * 4;
const COMPRESSED_HASH_SIZE: u32 = 32 / 4; // 8
const WORKGROUP_SIZE: u32 = 256;
const GRID_SIZE: u32 = 32768;

struct Pow4Result {
    nonce: u32,
    hash: array<u32, COMPRESSED_HASH_SIZE>,
};

@group(0) @binding(0) var<storage, read> header: array<u32, HEADER_SIZE>;
var<workgroup> workgroup_results: array<Pow4Result, WORKGROUP_SIZE>;
@group(0) @binding(1) var<storage, read_write> grid_results: array<Pow4Result, GRID_SIZE>;
@group(0) @binding(2) var<storage, read_write> final_result: Pow4Result;

struct SHA256_CTX {
  data: array<u32, 64>,
  datalen: u32,
  bitlen: array<u32, 2>,
  state: array<u32, 8>,
  info: u32,
};

const SHA256_BLOCK_SIZE = 32;
const SHA256_MAX_INPUT_SIZE : u32 = 217;

const k = array<u32, 64>(
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
);

fn ROTLEFT(a: u32, b: u32) -> u32 {return (((a) << (b)) | ((a) >> (32 - (b))));}
fn ROTRIGHT(a: u32, b: u32) -> u32 {return (((a) >> (b)) | ((a) << (32 - (b))));}

fn CH(x: u32, y: u32, z: u32) -> u32 {return (((x) & (y)) ^ (~(x) & (z)));}
fn MAJ(x: u32, y: u32, z: u32) -> u32 {return (((x) & (y)) ^ ((x) & (z)) ^ ((y) & (z)));}
fn EP0(x: u32) -> u32 {return (ROTRIGHT(x, 2) ^ ROTRIGHT(x, 13) ^ ROTRIGHT(x, 22));}
fn EP1(x: u32) -> u32 {return (ROTRIGHT(x, 6) ^ ROTRIGHT(x, 11) ^ ROTRIGHT(x, 25));}
fn SIG0(x: u32) -> u32 {return (ROTRIGHT(x, 7) ^ ROTRIGHT(x, 18) ^ ((x) >> 3));}
fn SIG1(x: u32) -> u32 {return (ROTRIGHT(x, 17) ^ ROTRIGHT(x, 19) ^ ((x) >> 10));}

fn sha256_transform(ctx: ptr<function, SHA256_CTX>) {
    var a: u32;
    var b: u32;
    var c: u32;
    var d: u32;
    var e: u32;
    var f: u32;
    var g: u32;
    var h: u32;
    var i: u32 = 0;
    var j: u32 = 0;
    var t1: u32;
    var t2: u32;
    var m: array<u32, 64> ;

    while i < 16 {
        m[i] = ((*ctx).data[j] << 24) | ((*ctx).data[j + 1] << 16) | ((*ctx).data[j + 2] << 8) | ((*ctx).data[j + 3]);
        i++;
        j += 4;
    }

    while i < 64 {
        m[i] = SIG1(m[i - 2]) + m[i - 7] + SIG0(m[i - 15]) + m[i - 16];
        i++;
    }

    a = (*ctx).state[0];
    b = (*ctx).state[1];
    c = (*ctx).state[2];
    d = (*ctx).state[3];
    e = (*ctx).state[4];
    f = (*ctx).state[5];
    g = (*ctx).state[6];
    h = (*ctx).state[7];

    i = 0;
    for (; i < 64; i++) {
        t1 = h + EP1(e) + CH(e, f, g) + k[i] + m[i];
        t2 = EP0(a) + MAJ(a, b, c);
        h = g;
        g = f;
        f = e;
        e = d + t1;
        d = c;
        c = b;
        b = a;
        a = t1 + t2;
    }


    (*ctx).state[0] += a;
    (*ctx).state[1] += b;
    (*ctx).state[2] += c;
    (*ctx).state[3] += d;
    (*ctx).state[4] += e;
    (*ctx).state[5] += f;
    (*ctx).state[6] += g;
    (*ctx).state[7] += h;
}

fn sha256_update_HEADER_SIZE(ctx: ptr<function, SHA256_CTX>, data: array<u32, HEADER_SIZE>) {
    var len: u32 = HEADER_SIZE;
    for (var i: u32 = 0; i < len; i++) {
        (*ctx).data[(*ctx).datalen] = data[i];
        (*ctx).datalen++;
        if (*ctx).datalen == 64 {
            sha256_transform(ctx);

            if (*ctx).bitlen[0] > 0xffffffff - (512) {
                (*ctx).bitlen[1]++;
            }
            (*ctx).bitlen[0] += 512;

            (*ctx).datalen = 0;
        }
    }
}

fn sha256_update_HASH_SIZE(ctx: ptr<function, SHA256_CTX>, data: array<u32, HASH_SIZE>) {
    var len: u32 = HASH_SIZE;
    for (var i: u32 = 0; i < len; i++) {
        (*ctx).data[(*ctx).datalen] = data[i];
        (*ctx).datalen++;
        if (*ctx).datalen == 64 {
            sha256_transform(ctx);

            if (*ctx).bitlen[0] > 0xffffffff - (512) {
                (*ctx).bitlen[1]++;
            }
            (*ctx).bitlen[0] += 512;

            (*ctx).datalen = 0;
        }
    }
}

fn sha256_update_FINAL_PRE_HASH_SIZE(ctx: ptr<function, SHA256_CTX>, data: array<u32, FINAL_PRE_HASH_SIZE>) {
    var len: u32 = FINAL_PRE_HASH_SIZE;
    for (var i: u32 = 0; i < len; i++) {
        (*ctx).data[(*ctx).datalen] = data[i];
        (*ctx).datalen++;
        if (*ctx).datalen == 64 {
            sha256_transform(ctx);

            if (*ctx).bitlen[0] > 0xffffffff - (512) {
                (*ctx).bitlen[1]++;
            }
            (*ctx).bitlen[0] += 512;

            (*ctx).datalen = 0;
        }
    }
}

fn sha256_final(ctx: ptr<function, SHA256_CTX>, hash: ptr<function, array<u32, SHA256_BLOCK_SIZE>>) {
    var i: u32 = (*ctx).datalen;

    if (*ctx).datalen < 56 {
        (*ctx).data[i] = 0x80;
        i++;
        while i < 56 {
            (*ctx).data[i] = 0x00;
            i++;
        }
    } else {
        (*ctx).data[i] = 0x80;
        i++;
        while i < 64 {
            (*ctx).data[i] = 0x00;
            i++;
        }
        sha256_transform(ctx);
        for (var i = 0; i < 56 ; i++) {
            (*ctx).data[i] = 0;
        }
    }

    if (*ctx).bitlen[0] > 0xffffffff - (*ctx).datalen * 8 {
        (*ctx).bitlen[1]++;
    }
    (*ctx).bitlen[0] += (*ctx).datalen * 8;


    (*ctx).data[63] = (*ctx).bitlen[0];
    (*ctx).data[62] = (*ctx).bitlen[0] >> 8;
    (*ctx).data[61] = (*ctx).bitlen[0] >> 16;
    (*ctx).data[60] = (*ctx).bitlen[0] >> 24;
    (*ctx).data[59] = (*ctx).bitlen[1];
    (*ctx).data[58] = (*ctx).bitlen[1] >> 8;
    (*ctx).data[57] = (*ctx).bitlen[1] >> 16;
    (*ctx).data[56] = (*ctx).bitlen[1] >> 24;
    sha256_transform(ctx);

    for (i = 0; i < 4; i++) {
        (*hash)[i] = ((*ctx).state[0] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 4] = ((*ctx).state[1] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 8] = ((*ctx).state[2] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 12] = ((*ctx).state[3] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 16] = ((*ctx).state[4] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 20] = ((*ctx).state[5] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 24] = ((*ctx).state[6] >> (24 - i * 8)) & 0x000000ff;
        (*hash)[i + 28] = ((*ctx).state[7] >> (24 - i * 8)) & 0x000000ff;
    }
}

fn sha256_full_HEADER_SIZE(data: array<u32, HEADER_SIZE>, hash_result: ptr<function, array<u32, 32>>) {
    var ctx: SHA256_CTX;
    var buf: array<u32, SHA256_BLOCK_SIZE>;

    // CTX INIT
    ctx.datalen = 0;
    ctx.bitlen[0] = 0;
    ctx.bitlen[1] = 0;
    ctx.state[0] = 0x6a09e667;
    ctx.state[1] = 0xbb67ae85;
    ctx.state[2] = 0x3c6ef372;
    ctx.state[3] = 0xa54ff53a;
    ctx.state[4] = 0x510e527f;
    ctx.state[5] = 0x9b05688c;
    ctx.state[6] = 0x1f83d9ab;
    ctx.state[7] = 0x5be0cd19;

    sha256_update_HEADER_SIZE(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

fn sha256_full_HASH_SIZE(data: array<u32, HASH_SIZE>, hash_result: ptr<function, array<u32, 32>>) {
    var ctx: SHA256_CTX;
    var buf: array<u32, SHA256_BLOCK_SIZE>;

    // CTX INIT
    ctx.datalen = 0;
    ctx.bitlen[0] = 0;
    ctx.bitlen[1] = 0;
    ctx.state[0] = 0x6a09e667;
    ctx.state[1] = 0xbb67ae85;
    ctx.state[2] = 0x3c6ef372;
    ctx.state[3] = 0xa54ff53a;
    ctx.state[4] = 0x510e527f;
    ctx.state[5] = 0x9b05688c;
    ctx.state[6] = 0x1f83d9ab;
    ctx.state[7] = 0x5be0cd19;

    sha256_update_HASH_SIZE(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

fn sha256_full_FINAL_PRE_HASH_SIZE(data: array<u32, FINAL_PRE_HASH_SIZE>, hash_result: ptr<function, array<u32, 32>>) {
    var ctx: SHA256_CTX;
    var buf: array<u32, SHA256_BLOCK_SIZE>;

    // CTX INIT
    ctx.datalen = 0;
    ctx.bitlen[0] = 0;
    ctx.bitlen[1] = 0;
    ctx.state[0] = 0x6a09e667;
    ctx.state[1] = 0xbb67ae85;
    ctx.state[2] = 0x3c6ef372;
    ctx.state[3] = 0xa54ff53a;
    ctx.state[4] = 0x510e527f;
    ctx.state[5] = 0x9b05688c;
    ctx.state[6] = 0x1f83d9ab;
    ctx.state[7] = 0x5be0cd19;

    sha256_update_FINAL_PRE_HASH_SIZE(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

// this method is just for debugging purposes. all we do is hash the header with sha256
// and store the result in the hash_result array.
@compute @workgroup_size(WORKGROUP_SIZE, 1, 1)
fn debug_hash_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var local_header: array<u32, HEADER_SIZE>;
    for (var i: u32 = 0; i < HEADER_SIZE; i++) {
        local_header[i] = header[i];
    }
    var hash_result: array<u32, 32>;
    sha256_full_HEADER_SIZE(local_header, &hash_result);

    var compressed_result: array<u32, COMPRESSED_HASH_SIZE>;
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

fn pow4_elementary_iteration(header: array<u32, HEADER_SIZE>) -> array<u32, COMPRESSED_HASH_SIZE> {
    // first, hash the header
    var matrix_A_row_1: array<u32, HASH_SIZE>;
    sha256_full_HEADER_SIZE(header, &matrix_A_row_1);
    
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
        var new_column: array<u32, HASH_SIZE>;
        sha256_full_HASH_SIZE(matrix_B_working_column, &new_column);
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
    // operation. we will now hash this row to get the uncompressed hash.
    var uncompressed_hash: array<u32, HASH_SIZE>;
    sha256_full_FINAL_PRE_HASH_SIZE(final_pre_hash, &uncompressed_hash);

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
        compressed_hash[j] += (uncompressed_hash[i] & 0xff) << (k * 8);
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
    hash_result = pow4_elementary_iteration(local_header);

    // now we need to store the hash result in the final_result array
    if global_id.x == 0 {
        for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
            final_result.hash[i] = hash_result[i];
        }
    }
}

@compute @workgroup_size(WORKGROUP_SIZE, 1, 1)
fn pow4_workgroup_reduce(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let global_thread_id: u32 = global_id.x;
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
    // it can be up to WORKGROUP_SIZE * GRID_SIZE.
    var nonce: u32 = global_thread_id;

    // now we have to update the nonce in the header. we do this in *big endian*
    local_header[NONCE_START] = (nonce >> 24) & 0xff; // Most significant byte first
    local_header[NONCE_START + 1] = (nonce >> 16) & 0xff; // Third least significant byte
    local_header[NONCE_START + 2] = (nonce >> 8) & 0xff; // Second least significant byte
    local_header[NONCE_START + 3] = nonce & 0xff; // Least significant byte last

    // now each workgroup will need to run the elementary iteration. then we store the result
    // in the shared memory workgroup_results array.
    var result: Pow4Result;
    result.nonce = nonce;
    var result_hash: array<u32, COMPRESSED_HASH_SIZE> = pow4_elementary_iteration(local_header);
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
fn pow4_grid_reduce(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let global_thread_id: u32 = global_id.x;

    // we need to find the lowest hash in the grid_results array. we will store
    // this in the final_result array. we only do this once for the entire
    // grid. this is the final reduction.
    if global_thread_id == 0 {
        var lowest_hash: array<u32, COMPRESSED_HASH_SIZE>;
        for (var i: u32 = 0; i < COMPRESSED_HASH_SIZE; i++) {
            lowest_hash[i] = 0xffffffff;
        }
        for (var i: u32 = 0; i < GRID_SIZE; i++) {
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

