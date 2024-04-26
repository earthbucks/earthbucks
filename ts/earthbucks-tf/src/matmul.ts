import * as tf from "@tensorflow/tfjs";
import { blake3Hash } from "earthbucks-lib/src/blake3";
import { Buffer } from "buffer";

export default class Matmul {
  seed: Uint8Array;

  constructor(seed: Uint8Array) {
    this.seed = seed;
  }

  blake3Hash(seed: Buffer): Buffer {
    return Buffer.from(blake3Hash(seed));
  }

  async createBinaryMatrix(size: number): Promise<tf.Tensor> {
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

    // tensorflow doesn't support uint16, but it does support int32
    return tf.tensor2d(matrixData, [size, size], "int32");
  }

  async squareMatrix(matrix: tf.Tensor): Promise<tf.Tensor> {
    return tf.matMul(matrix, matrix);
  }

  async matmul256(): Promise<Buffer> {
    let matrix = await this.createBinaryMatrix(256);
    let squared = await this.squareMatrix(matrix);
    let squaredBufU16 = squared.dataSync();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  async matmul400(): Promise<Buffer> {
    let matrix = await this.createBinaryMatrix(400);
    let squared = await this.squareMatrix(matrix);
    let squaredBufU16 = squared.dataSync();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  async matmul512(): Promise<Buffer> {
    let matrix = await this.createBinaryMatrix(512);
    let squared = await this.squareMatrix(matrix);
    let squaredBufU16 = squared.dataSync();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }

  async matmul1024(): Promise<Buffer> {
    let matrix = await this.createBinaryMatrix(1024);
    let squared = await this.squareMatrix(matrix);
    let squaredBufU16 = squared.dataSync();
    let squaredBufU8: number[] = [];

    for (let x of squaredBufU16) {
      squaredBufU8.push(x & 0xff);
      squaredBufU8.push(x >> 8);
    }

    return this.blake3Hash(Buffer.from(squaredBufU8));
  }
}
