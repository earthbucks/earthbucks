import {
  create_pow2,
  Pow2 as Pow2Raw,
  sha256 as sha256Raw,
} from "./rs-earthbucks_pow2-inline-base64/earthbucks_pow2.js";
import { Header, WebBuf, FixedBuf } from "@earthbucks/lib";

type HEADER_SIZE = 217;

export class Pow2 {
  private pow2: Pow2Raw;

  constructor(header: FixedBuf<HEADER_SIZE>) {
    this.pow2 = create_pow2(header.buf);
  }

  async init(): Promise<void> {
    // nothing to do for wasm init
  }

  async debugGetHeaderHash(): Promise<FixedBuf<32>> {
    const arr = this.pow2.debug_get_header_hash();
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
  }

  async debugGetFinalMatrixDataHash(): Promise<FixedBuf<32>> {
    this.pow2.create_matrix_data_from_hashes();
    const arr = this.pow2.debug_get_final_matrix_data_hash();
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
  }

  async debugGetM1First32(): Promise<Uint32Array> {
    this.pow2.create_matrix_data_from_hashes();
    this.pow2.fill_in_matrices_from_data();
    const arr = this.pow2.debug_get_m1_first_32();
    return new Uint32Array(arr);
  }

  async debugGetM2First32(): Promise<Uint32Array> {
    this.pow2.create_matrix_data_from_hashes();
    this.pow2.fill_in_matrices_from_data();
    const arr = this.pow2.debug_get_m2_first_32();
    return new Uint32Array(arr);
  }

  async debugGetM3First32(): Promise<Uint32Array> {
    this.pow2.create_matrix_data_from_hashes();
    this.pow2.fill_in_matrices_from_data();
    this.pow2.multiply_m1_times_m2_equals_m3();
    const arr = this.pow2.debug_get_m3_first_32();
    return new Uint32Array(arr);
  }

  async debugGetM4Hash(): Promise<FixedBuf<32>> {
    this.pow2.create_matrix_data_from_hashes();
    this.pow2.fill_in_matrices_from_data();
    this.pow2.multiply_m1_times_m2_equals_m3();
    this.pow2.multiply_m3_by_pi_to_get_m4();
    this.pow2.convert_m4_to_bytes();
    this.pow2.hash_m4();
    const arr = this.pow2.debug_get_m4_hash();
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
  }
}

export async function sha256(data: WebBuf): Promise<FixedBuf<32>> {
  const arr = sha256Raw(data);
  return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
}
