import * as math from "mathjs";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import BufferWriter from "./buffer-writer";
import { Buffer } from "buffer";

export default class Matmul {
  seed: Uint8Array;

  constructor(seed: Uint8Array) {
    this.seed = seed;
  }

  blake3Hash(seed: Buffer): Buffer {
    return Buffer.from(blake3Hash(seed));
  }

  createBinary256Matrix(): math.Matrix {
    let size = 256;
    let matrixData: number[][] = [];
    let currentHash = this.blake3Hash(Buffer.from(this.seed));

    // TODO: To support other sizes, use a 1 dimensional array and then slice
    for (let i = 0; i < size; i++) {
      let row: number[] = [];
      for (let byte of currentHash) {
        for (let bit = 0; bit < 8; bit++) {
          let value = (byte >> bit) & 1;
          row.push(value);
        }
      }
      matrixData.push(row);
      currentHash = this.blake3Hash(currentHash);
    }

    return math.matrix(matrixData, "dense", "number");
  }

  //   pub fn create_binary_matrix(&self, size: usize) -> Array2<u16> {
  //     let mut matrix_data = Vec::new();

  //     let mut current_hash = blake3_hash(&self.seed);
  //     let mut hash_iter = current_hash.iter().cycle();

  //     for _ in 0..size {
  //         for _ in 0..size {
  //             let byte = *hash_iter.next().unwrap();
  //             for bit in (0..8).rev() {
  //                 let value = ((byte >> bit) & 1) as u16;
  //                 matrix_data.push(value);
  //             }
  //             if matrix_data.len() >= size * size {
  //                 break;
  //             }
  //         }
  //         if matrix_data.len() >= size * size {
  //             break;
  //         }
  //         current_hash = blake3_hash(&current_hash);
  //         hash_iter = current_hash.iter().cycle();
  //     }

  //     Array2::from_shape_vec((size, size), matrix_data).unwrap()
  // }

  createBinaryMatrix(size: number): math.Matrix {
    let matrixData: number[] = [];
    let currentHash = this.blake3Hash(Buffer.from(this.seed));
    let hashIter = currentHash[Symbol.iterator]();

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let { value: byte, done } = hashIter.next();
        if (done) {
          currentHash = this.blake3Hash(currentHash);
          hashIter = currentHash[Symbol.iterator]();
          byte = hashIter.next().value;
        }
        for (let bit = 7; bit >= 0; bit--) {
          let value = (byte >> bit) & 1;
          matrixData.push(value);
          if (matrixData.length >= size * size) {
            break;
          }
        }
        if (matrixData.length >= size * size) {
          break;
        }
      }
      if (matrixData.length >= size * size) {
        break;
      }
      currentHash = this.blake3Hash(Buffer.from(currentHash));
      hashIter = currentHash[Symbol.iterator]();
    }

    let matrixData2D: number[][] = [];
    while (matrixData.length) matrixData2D.push(matrixData.splice(0, size));

    return math.matrix(matrixData2D, "dense", "number");
  }

  squareMatrix(matrix: math.Matrix): math.Matrix {
    return math.multiply(matrix, matrix) as math.Matrix;
  }

  matmul256a(): Buffer {
    let matrix = this.createBinary256Matrix();
    let squared = this.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  matmul256b(): Buffer {
    let matrix = this.createBinaryMatrix(256);
    let squared = this.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }
}
