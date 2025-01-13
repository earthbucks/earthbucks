/* tslint:disable */
/* eslint-disable */
export function create_pow2(header: Uint8Array, reset_nonce: boolean): Pow2;
export function sha256(input: Uint8Array): Uint8Array;
export class Pow2 {
  free(): void;
  /**
   *
   *     * This is the reference implementation of EarthBucks Pow2. The purpose of writing this in rust
   *     * is twofold:
   *     * - Have a reference implementation with standardized test vectors for re-implementation in
   *     * WebGPU
   *     * - Be able to verify PoW solutions quickly on a CPU.
   *     
   */
  constructor(header: Uint8Array, reset_nonce: boolean);
  /**
   *
   *     * This uses the nonce to hash the header over and over, 64 times, and produce a very long
   *     * piece of data which we will turn into two pseudo-random matrices which we later multiply
   *     * together.
   *     
   */
  create_matrix_data_from_hashes(): void;
  /**
   *
   *     * The next thing we want to do is as follows. We have generated two bits of data per element
   *     * in each matrix. What we want to do is to take each two bits, in big endian order, and
   *     * convert them into a u32. We then store these u32 values into each matrix, m1, and m2. We
   *     * fill them in from left to right.
   *     
   */
  fill_in_matrices_from_data(): void;
  /**
   *
   *     * Now that we have the two matrices, we can multiply them together to get a third matrix.
   *     
   */
  multiply_m1_times_m2_equals_m3(): void;
  /**
   *
   *     * now we want to include a simple floating point operation. so we multiply each u32 value in
   *     * the m3 matrix by 3.14 to get the m3_float matrix
   *     
   */
  multiply_m3_by_pi_to_get_m4(): void;
  /**
   *
   *     * now that we have the result of the matrix multiplication, and we've converted that matrix
   *     * (m3) into a float matrix (m4), by multiplying it by 3.14, now we want to convert each one of
   *     * these floating point values into a byte representation. we use big-endian representation.
   *     
   */
  convert_m4_to_bytes(): void;
  /**
   *
   *     * Now that we have the result of the matrix multiplication, and performed one floating point
   *     * operation, we want to perform the sha256 hash of the output matrix (m4).
   *     
   */
  hash_m4(): void;
  /**
   *
   *     * now we're getting ready to run the full algorithm. but first, we're going to to need a
   *     * method that looks at the output of the hash, m4_hash, and determines whether the first 11
   *     * bits are zero. if the first 11 bits are zero, return true. otherwise, return false.
   *     *
   *     * why 11? because this corresponds to an iteration of about 2048 times, and it so happens that
   *     * if we are doing a matmul of size 128x128, then the number of operations multipled by ~2000
   *     * happens to equal the number of operations of a 1627x1627 matmul, which was the first PoW
   *     * algo of EarthBucks. This means, in other words, we have a "PoW inside a PoW" which roughly
   *     * equals the total number of operations to actually perform the PoW, but where verifying it
   *     * requires only a small fraction (just one 128x128 matmul).
   *     
   */
  check_m4_hash_11_bits(): boolean;
  /**
   *
   *     * now let's put all the methods in order and run a single full-iteration of the pow algo
   *     
   */
  run_single_iteration(): void;
  /**
   *
   *     * now we are ready to perform the full proof-of-work algorithm. we want to iterate the nonce
   *     * as many times as it takes for check_m4_hash to return true. when it does, we want to set the
   *     * final_nonce to the current nonce.
   *     
   */
  run_full_pow(): void;
  /**
   *
   *     * suppose we have a successful run. we need a method to get the header with the final nonce in
   *     * it.
   *     
   */
  get_header_with_final_nonce(): Uint8Array;
  /**
   *
   *     * now suppose we receive a header from somewhere, and we want to verify the pow. we should be
   *     * able to hash it, using the nonce already included in the header, and then run the full pow
   *     * algorithm, just one iteration, to verify the hash passes the check_m4_hash_11_bits method.
   *     
   */
  static verify_pow(header: Uint8Array): boolean;
}
