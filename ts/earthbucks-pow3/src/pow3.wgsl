const HEADER_SIZE: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 32 + 2 + 32 + 2 + 32; // 217
const NONCE_START: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32; // 117
const NONCE_END: u32 = 1 + 32 + 32 + 8 + 8 + 4 + 32 + 4; // 221
const HASH_SIZE: u32 = 32;
const MANY_HASH_1_SIZE: u32 = 32 * 32 * 4 * 2; // 8192
const MATRIX_SIZE_1D: u32 = 32 * 4; // 128
const MATRIX_SIZE_2D: u32 = (32 * 4) * (32 * 4); // 16384
const MANY_HASH_2_SIZE: u32 = (65536 / 256) * 32; // 8192
const FINAL_HASH_SIZE: u32 = 32;

struct Pow3 {
    current_nonce: u32,
    working_header: array<u32, HEADER_SIZE>,
    working_header_hash: array<u32, HASH_SIZE>,
    many_hash_1: array<u32, MANY_HASH_1_SIZE>,
    m1: array<u32, MATRIX_SIZE_2D>,
    m2: array<u32, MATRIX_SIZE_2D>,
    m3: array<u32, MATRIX_SIZE_2D>,
    m4: array<f32, MATRIX_SIZE_2D>,
    many_hash_2: array<u32, MANY_HASH_2_SIZE>,
    final_hash: array<u32, HASH_SIZE>,
    final_hash_starts_with_11_zeros: u32,
    final_nonce: u32,
};

@group(0) @binding(0) var<storage, read> header: array<u32, HEADER_SIZE>;
@group(0) @binding(1) var<storage, read_write> pow3: Pow3;

@compute @workgroup_size(256, 1, 1)
fn set_nonce_from_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x != 0 {
        return;
    }

    pow3.current_nonce = (header[NONCE_START] << 24) | (header[NONCE_START + 1] << 16) | (header[NONCE_START + 2] << 8) | (header[NONCE_START + 3]);
}

@compute @workgroup_size(256, 1, 1)
fn increment_nonce(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        pow3.current_nonce = pow3.current_nonce + 1u;
    }
}

@compute @workgroup_size(256, 1, 1)
fn set_working_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        for (var i: u32 = 0; i < 217; i++) {
            pow3.working_header[i] = header[i];
        }
        // Set the nonce in the working header in big-endian format
        pow3.working_header[NONCE_START] = (pow3.current_nonce >> 24) & 0xff; // Most significant byte first
        pow3.working_header[NONCE_START + 1] = (pow3.current_nonce >> 16) & 0xff; // Third least significant byte
        pow3.working_header[NONCE_START + 2] = (pow3.current_nonce >> 8) & 0xff; // Second least significant byte
        pow3.working_header[NONCE_START + 3] = pow3.current_nonce & 0xff; // Least significant byte last
    }
}

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

fn sha256_update_36(ctx: ptr<function, SHA256_CTX>, data: array<u32, 36>) {
    var len: u32 = 36;
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

fn sha256_update_256(ctx: ptr<function, SHA256_CTX>, data: array<u32, 256>) {
    var len: u32 = 256;
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

fn sha256_update_8192(ctx: ptr<function, SHA256_CTX>, data: array<u32, 8192>) {
    var len: u32 = 8192;
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

fn sha256_full_36(data: array<u32, 36>, hash_result: ptr<function, array<u32, 32>>) {
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

    sha256_update_36(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

fn sha256_full_256(data: array<u32, 256>, hash_result: ptr<function, array<u32, 32>>) {
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

    sha256_update_256(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

fn sha256_full_8192(data: array<u32, 8192>, hash_result: ptr<function, array<u32, 32>>) {
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

    sha256_update_8192(&ctx, data);
    sha256_final(&ctx, &buf);

    for (var i = 0; i < 32; i++) {
        (*hash_result)[i] = buf[i];
    }
}

@compute @workgroup_size(256, 1, 1)
fn hash_working_header(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        var hash_result: array<u32, 32>;
        sha256_full_HEADER_SIZE(pow3.working_header, &hash_result);
        for (var i: u32 = 0; i < 32; i++) {
            pow3.working_header_hash[i] = hash_result[i];
        }
    }
}


// The way we fill in this data is as follows. We're going to run 256 sha256
// hashes. That is why the workgroup size is 256. Each separate thread performs
// one sha256. Each sha256 works as follows. First, we fill in the 'count'
// variable, which runs from 0 to 255, in little endian form as the first four
// bytes of a 36 byte buffer. The remaining 32 bytes are the hash of the
// working header. Thus, we have a 36 byte value, unique for each count. Now we
// sha256 hash that value. We take the resuling 32 byte hash and store those
// bytes in the many_hash_1 array. Thus, we have 256 32-byte values in
// many_hash_1.
@compute @workgroup_size(256, 1, 1)
fn fill_many_hash_1(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let count: u32 = global_id.x;

    if count >= 256 {
        return;
    }

    var result: array<u32, 36>;
    // note: *little* endian here
    result[0] = count & 0xff;
    result[1] = (count >> 8) & 0xff; // should be zero
    result[2] = (count >> 16) & 0xff; // should be zero
    result[3] = (count >> 24) & 0xff; // should be zero
    for (var i: u32 = 0; i < 32; i++) {
        result[i + 4] = pow3.working_header_hash[i];
    }

    var hash_result: array<u32, 32>;
    sha256_full_36(result, &hash_result);

    for (var i: u32 = 0; i < 32; i++) {
        pow3.many_hash_1[count * 32 + i] = hash_result[i];
    }
}

// TODO: This can be parallelized
@compute @workgroup_size(256, 1, 1)
fn create_m1_from_many_hash_1(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        var m1_index: u32 = 0;

        for (var i: u32 = 0; i < (MANY_HASH_1_SIZE / 2); i++) {
            var byte: u32 = pow3.many_hash_1[i];
            var twobits1: u32 = ((byte >> 6) & 3);
            var twobits2: u32 = ((byte >> 4) & 3);
            var twobits3: u32 = ((byte >> 2) & 3);
            var twobits4: u32 = (byte & 3);

            if m1_index < MATRIX_SIZE_2D {
                pow3.m1[m1_index] = twobits1;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                pow3.m1[m1_index] = twobits2;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                pow3.m1[m1_index] = twobits3;
                m1_index += 1;
            }
            if m1_index < MATRIX_SIZE_2D {
                pow3.m1[m1_index] = twobits4;
                m1_index += 1;
            }
        }
    }
}

// TODO: This can be parallelized
@compute @workgroup_size(256, 1, 1)
fn create_m2_from_many_hash_1(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        var m2_index: u32 = 0;

        for (var i: u32 = (MANY_HASH_1_SIZE / 2); i < MANY_HASH_1_SIZE; i++) {
            var byte: u32 = pow3.many_hash_1[i];
            var twobits1: u32 = ((byte >> 6) & 3);
            var twobits2: u32 = ((byte >> 4) & 3);
            var twobits3: u32 = ((byte >> 2) & 3);
            var twobits4: u32 = (byte & 3);

            if m2_index < MATRIX_SIZE_2D {
                pow3.m2[m2_index] = twobits1;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                pow3.m2[m2_index] = twobits2;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                pow3.m2[m2_index] = twobits3;
                m2_index += 1;
            }
            if m2_index < MATRIX_SIZE_2D {
                pow3.m2[m2_index] = twobits4;
                m2_index += 1;
            }
        }
    }
}

//@compute @workgroup_size(1, 1, 1)
//fn multiply_m1_times_m2_equals_m3(@builtin(global_invocation_id) global_id: vec3<u32>) {
//    for (var row: u32 = 0; row < 128; row++) {
//        for (var col: u32 = 0; col < 128; col++) {
//            var sum: u32 = 0;
//            for (var k: u32 = 0; k < 128; k++) {
//                sum += pow3.m1[row * 128 + k] * pow3.m2[k * 128 + col];
//            }
//            pow3.m3[row * 128 + col] = sum;
//        }
//    }
//}

//// must use workgroups of number 16x16
//@compute @workgroup_size(8, 8, 1)
//fn multiply_m1_times_m2_equals_m3(@builtin(global_invocation_id) global_id: vec3<u32>) {
//    let row: u32 = global_id.x;
//    let col: u32 = global_id.y;
//
//    if row >= 128 {
//        return; // prevent out-of-bounds access
//    }
//    if col >= 128 {
//        return;  // prevent out-of-bounds access
//    }
//
//    var sum: u32 = 0;
//    for (var k: u32 = 0; k < 128; k++) {
//        sum += pow3.m1[row * 128 + k] * pow3.m2[k * 128 + col];
//    }
//    pow3.m3[row * 128 + col] = sum;
//}

@compute @workgroup_size(256, 1, 1)
fn multiply_m1_times_m2_equals_m3(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let thread_id = global_id.x;

    // Calculate the total number of elements (128x128 = 16384)
    let total_elements: u32 = 128 * 128;

    // Calculate the number of elements each thread is responsible for, using integer division
    let elements_per_thread: u32 = (total_elements + 255) / 256;

    // Calculate the start and end element indices for the thread
    let start_element: u32 = thread_id * elements_per_thread;
    let end_element: u32 = min(start_element + elements_per_thread, total_elements);

    for (var i: u32 = start_element; i < end_element; i++) {
      // Calculate the row and column from the index
        let row: u32 = i / 128;
        let col: u32 = i % 128;

      // Perform the matrix multiplication logic
        var sum: u32 = 0;
        for (var k: u32 = 0; k < 128; k++) {
            sum += pow3.m1[row * 128 + k] * pow3.m2[k * 128 + col];
        }
        pow3.m3[row * 128 + col] = sum;
    }
}

@compute @workgroup_size(256, 1, 1)
fn multiply_m3_by_pi_to_get_m4(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var i: u32 = global_id.x;

    for (var j: u32 = 0; j < (128 * 128) / 256; j++) {
        pow3.m4[i * (128 * 128) / 256 + j] = f32(pow3.m3[i * (128 * 128) / 256 + j]) * 3.14;
    }
}

// now that we have m4, consisting of 128x128 floats, we want to hash it. now,
// we want everything parallelized at a size of 256. so we break it up into 256
// separate pieces, and hash each one of those separately. to hash them, we
// just first bitcast them to integers and then to big endian bytes. this just
// means we are getting a binary representation of each floating point number
// for hashing. the total number of hashes across the entire workgroup is 256.
@compute @workgroup_size(256, 1, 1)
fn create_many_hash_2_from_m4(@builtin(global_invocation_id) global_id: vec3<u32>) {
    var i: u32 = global_id.x;
    var new_bytes: array<u32, 256>;

    for (var j: u32 = 0; j < MATRIX_SIZE_2D / 256; j++) {
        var k: u32 = i * MATRIX_SIZE_2D / 256 + j;
        var value: f32 = pow3.m4[k];
        var int_value: u32 = bitcast<u32>(value);
        var bytes: array<u32, 4>;
        bytes[0] = (int_value >> 24) & 0xff;
        bytes[1] = (int_value >> 16) & 0xff;
        bytes[2] = (int_value >> 8) & 0xff;
        bytes[3] = int_value & 0xff;
        new_bytes[j * 4] = bytes[0];
        new_bytes[j * 4 + 1] = bytes[1];
        new_bytes[j * 4 + 2] = bytes[2];
        new_bytes[j * 4 + 3] = bytes[3];
    }

    var hash_result: array<u32, 32>;
    sha256_full_256(new_bytes, &hash_result);

    for (var k: u32 = 0; k < 32; k++) {
        pow3.many_hash_2[i * 32 + k] = hash_result[k];
    }
}

// now, finally, hash the many_hash_2 array. in this case, we simply do a
// serial sha256 hash on the whole thing.
@compute @workgroup_size(256, 1, 1)
fn create_final_hash_from_many_hash_2(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        var hash_result: array<u32, 32>;
        sha256_full_8192(pow3.many_hash_2, &hash_result);
        for (var i: u32 = 0; i < 32; i++) {
            pow3.final_hash[i] = hash_result[i];
        }
    }
}

@compute @workgroup_size(256, 1, 1)
fn check_final_hash_starts_with_11_zeros(@builtin(global_invocation_id) global_id: vec3<u32>) {
    if global_id.x == 0 {
        // note: each 'byte' is a u32, but they have a maximum of 8 bits
        var first_byte: u32 = pow3.final_hash[0];
        var second_byte: u32 = pow3.final_hash[1];
        var bit_1: u32 = (first_byte >> 7) & 1;
        var bit_2: u32 = (first_byte >> 6) & 1;
        var bit_3: u32 = (first_byte >> 5) & 1;
        var bit_4: u32 = (first_byte >> 4) & 1;
        var bit_5: u32 = (first_byte >> 3) & 1;
        var bit_6: u32 = (first_byte >> 2) & 1;
        var bit_7: u32 = (first_byte >> 1) & 1;
        var bit_8: u32 = first_byte & 1;
        var bit_9: u32 = (second_byte >> 7) & 1;
        var bit_10: u32 = (second_byte >> 6) & 1;
        var bit_11: u32 = (second_byte >> 5) & 1;
        var final_hash_starts_with_11_zeros: bool = bit_1 == 0 && bit_2 == 0 && bit_3 == 0 && bit_4 == 0 && bit_5 == 0 && bit_6 == 0 && bit_7 == 0 && bit_8 == 0 && bit_9 == 0 && bit_10 == 0 && bit_11 == 0;
        if final_hash_starts_with_11_zeros {
            pow3.final_hash_starts_with_11_zeros = 1;
            pow3.final_nonce = pow3.current_nonce;
        } else {
            pow3.final_hash_starts_with_11_zeros = 0;
            pow3.final_nonce = 0;
        }
    }
}

@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    const N_ITERATIONS: u32 = 700;
    var count: u32 = 0;

    while count < N_ITERATIONS {
        count = count + 1;

        // set_working_header
        if global_id.x == 0 {
            for (var i: u32 = 0; i < 217; i++) {
                pow3.working_header[i] = header[i];
            }
            // Set the nonce in the working header in big-endian format
            pow3.working_header[NONCE_START] = (pow3.current_nonce >> 24) & 0xff; // Most significant byte first
            pow3.working_header[NONCE_START + 1] = (pow3.current_nonce >> 16) & 0xff; // Third least significant byte
            pow3.working_header[NONCE_START + 2] = (pow3.current_nonce >> 8) & 0xff; // Second least significant byte
            pow3.working_header[NONCE_START + 3] = pow3.current_nonce & 0xff; // Least significant byte last
        }

        workgroupBarrier();

        // hash_working_header
        if global_id.x == 0 {
            var hash_result: array<u32, 32>;
            sha256_full_HEADER_SIZE(pow3.working_header, &hash_result);
            for (var i: u32 = 0; i < 32; i++) {
                pow3.working_header_hash[i] = hash_result[i];
            }
        }

        workgroupBarrier();

        // fill_many_hash_1
        if global_id.x >= 0 {
            let count: u32 = global_id.x;

            var result: array<u32, 36>;
            // note: *little* endian here
            result[0] = count & 0xff;
            result[1] = (count >> 8) & 0xff; // should be zero
            result[2] = (count >> 16) & 0xff; // should be zero
            result[3] = (count >> 24) & 0xff; // should be zero
            for (var i: u32 = 0; i < 32; i++) {
                result[i + 4] = pow3.working_header_hash[i];
            }

            var hash_result: array<u32, 32>;
            sha256_full_36(result, &hash_result);

            for (var i: u32 = 0; i < 32; i++) {
                pow3.many_hash_1[count * 32 + i] = hash_result[i];
            }
        }

        workgroupBarrier();

        // create_m1_from_many_hash_1
        if global_id.x == 0 {
            var m1_index: u32 = 0;

            for (var i: u32 = 0; i < (MANY_HASH_1_SIZE / 2); i++) {
                var byte: u32 = pow3.many_hash_1[i];
                var twobits1: u32 = ((byte >> 6) & 3);
                var twobits2: u32 = ((byte >> 4) & 3);
                var twobits3: u32 = ((byte >> 2) & 3);
                var twobits4: u32 = (byte & 3);

                if m1_index < MATRIX_SIZE_2D {
                    pow3.m1[m1_index] = twobits1;
                    m1_index += 1;
                }
                if m1_index < MATRIX_SIZE_2D {
                    pow3.m1[m1_index] = twobits2;
                    m1_index += 1;
                }
                if m1_index < MATRIX_SIZE_2D {
                    pow3.m1[m1_index] = twobits3;
                    m1_index += 1;
                }
                if m1_index < MATRIX_SIZE_2D {
                    pow3.m1[m1_index] = twobits4;
                    m1_index += 1;
                }
            }
        }

        workgroupBarrier();

        // create_m2_from_many_hash_1
        if global_id.x == 0 {
            var m2_index: u32 = 0;

            for (var i: u32 = (MANY_HASH_1_SIZE / 2); i < MANY_HASH_1_SIZE; i++) {
                var byte: u32 = pow3.many_hash_1[i];
                var twobits1: u32 = ((byte >> 6) & 3);
                var twobits2: u32 = ((byte >> 4) & 3);
                var twobits3: u32 = ((byte >> 2) & 3);
                var twobits4: u32 = (byte & 3);

                if m2_index < MATRIX_SIZE_2D {
                    pow3.m2[m2_index] = twobits1;
                    m2_index += 1;
                }
                if m2_index < MATRIX_SIZE_2D {
                    pow3.m2[m2_index] = twobits2;
                    m2_index += 1;
                }
                if m2_index < MATRIX_SIZE_2D {
                    pow3.m2[m2_index] = twobits3;
                    m2_index += 1;
                }
                if m2_index < MATRIX_SIZE_2D {
                    pow3.m2[m2_index] = twobits4;
                    m2_index += 1;
                }
            }
        }

        workgroupBarrier();

        // multiply_m1_times_m2_equals_m3
        if global_id.x >= 0 {
            let thread_id = global_id.x;

            // Calculate the total number of elements (128x128 = 16384)
            let total_elements: u32 = 128 * 128;

            // Calculate the number of elements each thread is responsible for, using integer division
            let elements_per_thread: u32 = (total_elements + 255) / 256;

            // Calculate the start and end element indices for the thread
            let start_element: u32 = thread_id * elements_per_thread;
            let end_element: u32 = min(start_element + elements_per_thread, total_elements);

            for (var i: u32 = start_element; i < end_element; i++) {
                // Calculate the row and column from the index
                let row: u32 = i / 128;
                let col: u32 = i % 128;

                // Perform the matrix multiplication logic
                var sum: u32 = 0;
                for (var k: u32 = 0; k < 128; k++) {
                    sum += pow3.m1[row * 128 + k] * pow3.m2[k * 128 + col];
                }
                pow3.m3[row * 128 + col] = sum;
            }
        }

        workgroupBarrier();

        // multiply_m3_by_pi_to_get_m4
        if global_id.x >= 0 {
            var i: u32 = global_id.x;

            for (var j: u32 = 0; j < (128 * 128) / 256; j++) {
                pow3.m4[i * (128 * 128) / 256 + j] = f32(pow3.m3[i * (128 * 128) / 256 + j]) * 3.14;
            }
        }

        workgroupBarrier();

        // create_many_hash_2_from_m4
        if global_id.x >= 0 {
            var i: u32 = global_id.x;
            var new_bytes: array<u32, 256>;

            for (var j: u32 = 0; j < MATRIX_SIZE_2D / 256; j++) {
                var k: u32 = i * MATRIX_SIZE_2D / 256 + j;
                var value: f32 = pow3.m4[k];
                var int_value: u32 = bitcast<u32>(value);
                var bytes: array<u32, 4>;
                bytes[0] = (int_value >> 24) & 0xff;
                bytes[1] = (int_value >> 16) & 0xff;
                bytes[2] = (int_value >> 8) & 0xff;
                bytes[3] = int_value & 0xff;
                new_bytes[j * 4] = bytes[0];
                new_bytes[j * 4 + 1] = bytes[1];
                new_bytes[j * 4 + 2] = bytes[2];
                new_bytes[j * 4 + 3] = bytes[3];
            }

            var hash_result: array<u32, 32>;
            sha256_full_256(new_bytes, &hash_result);

            for (var k: u32 = 0; k < 32; k++) {
                pow3.many_hash_2[i * 32 + k] = hash_result[k];
            }
        }

        workgroupBarrier();

        // create_final_hash_from_many_hash_2
        if global_id.x == 0 {
            var hash_result: array<u32, 32>;
            sha256_full_8192(pow3.many_hash_2, &hash_result);
            for (var i: u32 = 0; i < 32; i++) {
                pow3.final_hash[i] = hash_result[i];
            }
        }

        workgroupBarrier();

        // check_final_hash_starts_with_11_zeros
        if global_id.x == 0 {
            // note: each 'byte' is a u32, but they have a maximum of 8 bits
            var first_byte: u32 = pow3.final_hash[0];
            var second_byte: u32 = pow3.final_hash[1];
            var bit_1: u32 = (first_byte >> 7) & 1;
            var bit_2: u32 = (first_byte >> 6) & 1;
            var bit_3: u32 = (first_byte >> 5) & 1;
            var bit_4: u32 = (first_byte >> 4) & 1;
            var bit_5: u32 = (first_byte >> 3) & 1;
            var bit_6: u32 = (first_byte >> 2) & 1;
            var bit_7: u32 = (first_byte >> 1) & 1;
            var bit_8: u32 = first_byte & 1;
            var bit_9: u32 = (second_byte >> 7) & 1;
            var bit_10: u32 = (second_byte >> 6) & 1;
            var bit_11: u32 = (second_byte >> 5) & 1;
            var final_hash_starts_with_11_zeros: bool = bit_1 == 0 && bit_2 == 0 && bit_3 == 0 && bit_4 == 0 && bit_5 == 0 && bit_6 == 0 && bit_7 == 0 && bit_8 == 0 && bit_9 == 0 && bit_10 == 0 && bit_11 == 0;
            if final_hash_starts_with_11_zeros {
                pow3.final_hash_starts_with_11_zeros = 1;
                pow3.final_nonce = pow3.current_nonce;
            } else {
                //pow3.final_hash_starts_with_11_zeros = 0;
                //pow3.final_nonce = 0;
            }
        }

        workgroupBarrier();

        // increment_nonce
        if global_id.x == 0 {
            pow3.current_nonce = pow3.current_nonce + 1u;
        }
    }
}
