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

  createBinaryMatrix(size: number): math.Matrix {
    let matrixData: number[] = [];
    let currentHash = this.blake3Hash(Buffer.from(this.seed));
    let hashIter = currentHash.values();

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let byte = hashIter.next().value;
        if (byte === undefined) {
          currentHash = this.blake3Hash(currentHash);
          hashIter = currentHash.values();
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
    }

    let matrixData2D: number[][] = [];
    for (let i = 0; i < size; i++) {
      matrixData2D[i] = matrixData.slice(i * size, i * size + size);
    }

    return math.matrix(matrixData2D, "dense", "number");
  }

  squareMatrix(matrix: math.Matrix): math.Matrix {
    return math.multiply(matrix, matrix) as math.Matrix;
  }

  matmul256(): Buffer {
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

  matmul400(): Buffer {
    let matrix = this.createBinaryMatrix(400);
    let squared = this.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  matmul512(): Buffer {
    let matrix = this.createBinaryMatrix(512);
    let squared = this.squareMatrix(matrix);
    let squaredBufU16 = (squared.toArray() as number[][]).flat();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  matmul1024(): Buffer {
    let matrix = this.createBinaryMatrix(1024);
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
