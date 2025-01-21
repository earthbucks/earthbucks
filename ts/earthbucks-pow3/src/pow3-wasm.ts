import { Pow3 as Pow3Raw } from "./rs-earthbucks_pow3-inline-base64/earthbucks_pow3.js";
import { Header, WebBuf, FixedBuf } from "@earthbucks/lib";

type HEADER_SIZE = 217;

export class Pow3 {
  private pow3: Pow3Raw;

  constructor(header: FixedBuf<HEADER_SIZE>) {
    this.pow3 = new Pow3Raw(header.buf);
  }

  async init(): Promise<void> {
    this.pow3.set_nonce_from_header();
  }

  async iterate(): Promise<{
    hash: FixedBuf<32>;
    check: boolean;
    nonce: number;
  }> {
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
    this.pow3.check_final_hash_starts_with_11_zeros();
    this.pow3.increment_nonce();

    const hasha = this.pow3.get_final_hash();
    const check = this.pow3.get_final_hash_starts_with_11_zeros();
    const nonce = this.pow3.get_final_nonce();

    const hash = FixedBuf.fromBuf(32, WebBuf.fromUint8Array(hasha));

    return {
      hash,
      check,
      nonce,
    };
  }
}
