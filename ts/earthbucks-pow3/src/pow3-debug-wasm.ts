import { Pow3 as Pow3Raw } from "./rs-earthbucks_pow3-inline-base64/earthbucks_pow3.js";
import { Header, WebBuf, FixedBuf } from "@earthbucks/lib";

type HEADER_SIZE = 217;

export class Pow3 {
  private pow3: Pow3Raw;

  constructor(header: FixedBuf<HEADER_SIZE>) {
    this.pow3 = new Pow3Raw(header.buf);
  }

  async debugGetHeaderHash(): Promise<FixedBuf<32>> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    const arr = this.pow3.get_working_header_hash();
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
  }

  async debugGetManyHash1(): Promise<FixedBuf<8192>> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    const arr = this.pow3.get_many_hash_1();
    return FixedBuf.fromBuf(8192, WebBuf.fromUint8Array(arr));
  }

  async debugGetM1(): Promise<Uint32Array> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    const arr = this.pow3.get_m1();
    return arr;
  }

  async debugGetM2(): Promise<Uint32Array> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    this.pow3.create_m2_from_many_hash_1();
    const arr = this.pow3.get_m2();
    return arr;
  }

  async debugGetM3(): Promise<Uint32Array> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    this.pow3.create_m2_from_many_hash_1();
    this.pow3.multiply_m1_times_m2_equals_m3();
    const arr = this.pow3.get_m3();
    return arr;
  }

  async debugGetM4(): Promise<Float32Array> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    this.pow3.create_m2_from_many_hash_1();
    this.pow3.multiply_m1_times_m2_equals_m3();
    this.pow3.multiply_m3_by_pi_to_get_m4();
    const arr = this.pow3.get_m4();
    return arr;
  }

  async debugGetM4Bytes(): Promise<WebBuf> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    this.pow3.create_m2_from_many_hash_1();
    this.pow3.multiply_m1_times_m2_equals_m3();
    this.pow3.multiply_m3_by_pi_to_get_m4();
    this.pow3.convert_m4_to_bytes();
    const arr = this.pow3.get_m4_bytes();
    return WebBuf.fromUint8Array(arr);
  }

  async debugGetFinalHash(): Promise<FixedBuf<32>> {
    this.pow3.set_nonce_from_header();
    this.pow3.set_working_header();
    this.pow3.hash_working_header();
    this.pow3.fill_many_hash_1();
    this.pow3.create_m1_from_many_hash_1();
    this.pow3.create_m2_from_many_hash_1();
    this.pow3.multiply_m1_times_m2_equals_m3();
    this.pow3.multiply_m3_by_pi_to_get_m4();
    this.pow3.convert_m4_to_bytes();
    this.pow3.create_many_hash_2_from_m4_bytes();
    this.pow3.create_final_hash_from_many_hash_2();
    const arr = this.pow3.get_final_hash();
    return FixedBuf.fromBuf(32, WebBuf.fromUint8Array(arr));
  }
}
