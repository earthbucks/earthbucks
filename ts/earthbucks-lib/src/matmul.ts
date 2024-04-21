import * as mathjs from "mathjs";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import BufferWriter from "./buffer-writer";

export default class Matmul {
  source: Uint8Array;

  constructor(source: Uint8Array) {
    this.source = source;
  }

  hash_once(): Uint8Array {
    return blake3Hash(this.source);
  }

  gen_vector_32_u8(): Uint8Array {
    return this.hash_once();
  }

  gen_vector_32_u32(): Uint32Array {
    const hash0 = this.gen_vector_32_u8();
    const vec_u8 = Array.from(hash0);
    const vec_u32 = new Uint32Array(vec_u8);
    return vec_u32;
  }

  gen_vector_32(): math.Matrix {
    const hash0 = blake3Hash(this.source);
    const vec_u8 = Array.from(hash0);
    const vec_u32 = vec_u8.map((x) => x as number);
    return mathjs.matrix(vec_u32);
  }

  gen_matrix_32x32(): math.Matrix {
    let hash = blake3Hash(this.source);
    const hashes: number[][] = [];

    for (let i = 0; i < 32; i++) {
      hash = blake3Hash(hash);
      hashes.push(Array.from(hash));
    }

    return mathjs.matrix(hashes);
  }

  matmul_32_arr(): math.Matrix {
    const matrix = this.gen_matrix_32x32();
    const vector = this.gen_vector_32();
    const result = mathjs.multiply(matrix, vector);
    return mathjs.reshape(result, [32, 1]);
  }

  matmul_32_buf(): Uint8Array {
    const arr = this.matmul_32_arr();
    const vec: number[] = arr.valueOf() as number[];
    const buf = new Uint8Array(vec.length * 4);

    for (let i = 0; i < vec.length; i++) {
      const value = vec[i];
      buf[i * 4 + 0] = (value >> 24) & 0xff;
      buf[i * 4 + 1] = (value >> 16) & 0xff;
      buf[i * 4 + 2] = (value >> 8) & 0xff;
      buf[i * 4 + 3] = value & 0xff;
    }

    return buf;
  }
}
