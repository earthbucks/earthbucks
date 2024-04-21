import * as math from "mathjs";
import { blake3Hash, doubleBlake3Hash } from "./blake3";
import BufferWriter from "./buffer-writer";
import { Buffer } from "buffer";

export default class Matmul {
  source: Uint8Array;

  constructor(source: Uint8Array) {
    this.source = source;
  }

  blake3Hash(source: Buffer): Buffer {
    return Buffer.from(blake3Hash(source));
  }

  createBinaryMatrix(size: number): math.Matrix {
    let matrixData: number[][] = [];
    let currentHash = this.blake3Hash(Buffer.from(this.source));

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

    //return math.transpose(math.matrix(matrixData, "dense", "number"));
    return math.matrix(matrixData, "dense", "number");
  }

  squareMatrix(matrix: math.Matrix): math.Matrix {
    return math.multiply(matrix, matrix) as math.Matrix;
  }

  //   pub fn create_256x256_square_and_blake3_hash(&self) -> [u8; 32] {
  //     let matrix = self.create_256x256_binary_matrix();
  //     let squared = self.square_matrix(matrix);
  //     let squared_buf_u16 = squared.into_raw_vec();
  //     let squared_buf_u8: Vec<u8> = squared_buf_u16
  //         .iter()
  //         .flat_map(|&x| vec![(x & 0xFF) as u8, (x >> 8) as u8])
  //         .collect();
  //     blake3_hash(&squared_buf_u8)
  // }

  createSquareAndBlake3Hash(size: number): Buffer {
    let matrix = this.createBinaryMatrix(size);
    let squared = this.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  arrayToBuffer(matrix: math.Matrix): number[] {
    return matrix.toArray() as number[];
  }
}
