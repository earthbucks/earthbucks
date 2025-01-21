/* tslint:disable */
/* eslint-disable */
export class Pow3 {
  free(): void;
  /**
   *
   *     * This is the reference implementation of EarthBucks Pow3. The purpose of writing this in rust
   *     * is twofold:
   *     * - Have a reference implementation with standardized test vectors for re-implementation in
   *     * WebGPU
   *     * - Be able to verify PoW solutions quickly on a CPU.
   *     
   */
  constructor(header: Uint8Array);
  set_nonce_from_header(): void;
  increment_nonce(): void;
  set_working_header(): void;
  hash_working_header(): void;
  fill_many_hash_1(): void;
  /**
   *
   *     * The next thing we want to do is as follows. We have generated two bits of data per element
   *     * in each matrix. What we want to do is to take each two bits, in big endian order, and
   *     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
   *     * fill them in from left to right. This function is for the first matrix. The next function is
   *     * for the second matrix.
   *     
   */
  create_m1_from_many_hash_1(): void;
  create_m2_from_many_hash_1(): void;
  /**
   *
   *     * Now that we have the two matrices, we can multiply them together to get a third matrix. we
   *     * don't make any attempt to parallelize this operation. it will look different in wgsl.
   *     
   */
  multiply_m1_times_m2_equals_m3(): void;
  /**
   *
   *     * now we want to include a simple floating point operation. so we multiply each u32 value in
   *     * the m3 matrix by 3.14 to get the m3_float matrix.
   *     
   */
  multiply_m3_by_pi_to_get_m4(): void;
  /**
   *
   *     * now before hashing the matrix, we need to convert it to bytes. we do this by taking each f32
   *     * value, and converting it to a u8 array of 4 bytes. we then store these bytes in big endian
   *     * in the m4_bytes array. this is a 65536 byte array. again, to prepare for parallelism of size
   *     * 256, we have an outer loop of 256, with an inner loop of whatever the remainder is.
   *     
   */
  convert_m4_to_bytes(): void;
  /**
   *
   *     * now that we've got the m4 matrix in bytes, we are ready to hash it. now, as before, instead
   *     * of hashing this large value, which would be a giant serial operation, we want to hash it in
   *     * indepenent pieces so that it can be parallelized. our goal, as usual, is to have 256
   *     * simultaneous threads going on the gpu, so we need to break up the hashing into 256 separate
   *     * pieces. the simplest way to do this is to just run sha256 on each of 256 equal sized pieces.
   *     * after this stage, then there will be another stage hashing all those pieces together
   *     * (serially) for the final hash.
   *     
   */
  create_many_hash_2_from_m4_bytes(): void;
  /**
   *
   *     * now that we've done a bunch of parallel hashes, we now have a piece of data that is 8192
   *     * bytes long, which is far shorter than the 65536 bytes from the previous stage, but not long
   *     * enough to justify hashing in parallel. so we just want one final serial hash on this data,
   *     * to produce final_hash_data
   *     
   */
  create_final_hash_from_many_hash_2(): void;
  /**
   *
   *     * we're going to to need a method that looks at the output of the final hash and determines
   *     * whether the first 11 bits are zero. if the first 11 bits are zero, return true. otherwise,
   *     * return false.
   *     *
   *     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
   *     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
   *     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
   *     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
   *     * equals the total number of operations to actually perform the PoW, but where verifying it
   *     * requires only a small fraction (just one 128x128 matmul instead of 1627x1627).
   *     
   */
  check_final_hash_starts_with_11_zeros(): void;
  get_working_header(): Uint8Array;
  get_working_header_hash(): Uint8Array;
  get_many_hash_1(): Uint8Array;
  get_m1(): Uint32Array;
  get_m2(): Uint32Array;
  get_m3(): Uint32Array;
  get_m4(): Float32Array;
  get_m4_bytes(): Uint8Array;
  get_many_hash_2(): Uint8Array;
  get_final_hash(): Uint8Array;
  get_final_hash_starts_with_11_zeros(): boolean;
  get_final_nonce(): number;
}
