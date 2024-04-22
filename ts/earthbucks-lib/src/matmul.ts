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

  squareMatrix(matrix: math.Matrix): math.Matrix {
    return math.multiply(matrix, matrix) as math.Matrix;
  }

  create256SquareAndBlake3Hash(): Buffer {
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

  matmul256(): Buffer {
    return this.create256SquareAndBlake3Hash();
  }

  arrayToBuffer(matrix: math.Matrix): number[] {
    return matrix.toArray() as number[];
  }
}
