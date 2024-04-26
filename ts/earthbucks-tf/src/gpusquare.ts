import { createHash, hash as blake3Hash, hash } from "blake3";
import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";

type BufferFunction = (input: Buffer) => Buffer;
type AsyncBufferFunction = (input: Buffer) => Promise<Buffer>;

// - 257: The smallest prime number bigger than 256
// - 1289: The largest prime number whose cube fits into int32
// - 1624: The size of a matrix whose square has the same number of operations as the cube of the 1289 matrix
// - 1627 the next highest prime number after the number 1624
// - 9973: largest prime less than 10,000
// - 46337: largest prime whose square is an int32 (does not work on my machine - throws error)

class GpuSquare {
  workingBlockId: Buffer;
  previousBlockIds: Buffer[];
  workingSeed: tf.Tensor;
  steadySeed: tf.Tensor;
  blake3Hash: BufferFunction;
  asyncBlake3: AsyncBufferFunction;

  constructor(
    workingBlockId: Buffer,
    previousBlockIds: Buffer[],
    blake3Hash: BufferFunction,
    asyncBlake3: AsyncBufferFunction,
  ) {
    this.workingBlockId = workingBlockId;
    this.previousBlockIds = previousBlockIds;
    this.workingSeed = this.tensorFromBufferBits(workingBlockId);
    this.steadySeed = this.tensorFromBufferBits(
      Buffer.concat(previousBlockIds),
    );
    this.blake3Hash = blake3Hash;
    this.asyncBlake3 = asyncBlake3;
  }

  updateWorkingBlockId(workingBlockId: Buffer) {
    this.workingBlockId = workingBlockId;
    this.workingSeed = this.tensorFromBufferBits(workingBlockId);
  }

  tensorFromBufferBits(buffer: Buffer): tf.Tensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    let bufferIter = buffer.values();
    let bits: number[] = [];
    let bit: number | undefined;
    while ((bit = bufferIter.next().value) !== undefined) {
      for (let i = 7; i >= 0; i--) {
        bits.push((bit >> i) & 1);
      }
    }
    return tf.tensor1d(bits, "int32");
  }

  tensorSeed(): tf.Tensor {
    return tf.concat([this.workingSeed, this.steadySeed]);
  }

  tensorSeed1289(): tf.Tensor {
    const seedLength = this.tensorSeed().shape[0];
    const numTimes = Math.ceil((1289 * 1289) / seedLength);
    let result = tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, 1289 * 1289);
    return result;
  }

  tensorSeed1627(): tf.Tensor {
    const seedLength = this.tensorSeed().shape[0];
    const numTimes = Math.ceil((1627 * 1627) / seedLength);
    let result = tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, 1627 * 1627);
    return result;
  }

  tensorSeed9973(): tf.Tensor {
    const seedLength = this.tensorSeed().shape[0];
    const numTimes = Math.ceil((9973 * 9973) / seedLength);
    let result = tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, 9973 * 9973);
    return result;
  }

  seedToMatrix1289(seed: tf.Tensor): tf.Tensor {
    return seed.reshape([1289, 1289]);
  }

  seedToMatrix1627(seed: tf.Tensor): tf.Tensor {
    return seed.reshape([1627, 1627]);
  }

  seedToMatrix9973(seed: tf.Tensor): tf.Tensor {
    return seed.reshape([9973, 9973]);
  }

  // matrixCalculation(matrix: tf.Tensor): tf.Tensor {
  //   matrix = tf.matMul(tf.matMul(matrix, matrix), matrix);
  //   matrix = matrix.toFloat();
  //   matrix = matrix.sub(matrix.min());
  //   matrix = matrix.div(matrix.max());
  //   matrix = matrix.mul(1289);
  //   matrix = matrix.round();
  //   matrix = matrix.toInt();
  //   return matrix;
  // }

  matrixCube1289(matrix: tf.Tensor): tf.Tensor {
    return tf.tidy(() => {
      const matrix1 = tf.matMul(tf.matMul(matrix, matrix), matrix);
      const matrix2 = matrix1.toFloat();
      matrix1.dispose();
      const min = matrix2.min();
      const matrix3 = matrix2.sub(min);
      min.dispose();
      matrix2.dispose();
      const max = matrix3.max();
      const matrix4 = matrix3.div(max);
      max.dispose();
      matrix3.dispose();
      const matrix5 = matrix4.mul(1289);
      matrix4.dispose();
      const matrix6 = matrix5.round();
      matrix5.dispose();
      const matrix7 = matrix6.toInt();
      matrix6.dispose();
      return matrix7;
    });
  }

  matrixSquare1627(matrix: tf.Tensor): tf.Tensor {
    return tf.tidy(() => {
      const matrix1 = tf.matMul(matrix, matrix);
      const matrix2 = matrix1.toFloat();
      matrix1.dispose();
      const min = matrix2.min();
      const matrix3 = matrix2.sub(min);
      min.dispose();
      matrix2.dispose();
      const max = matrix3.max();
      const matrix4 = matrix3.div(max);
      max.dispose();
      matrix3.dispose();
      const matrix5 = matrix4.mul(1627);
      matrix4.dispose();
      const matrix6 = matrix5.round();
      matrix5.dispose();
      const matrix7 = matrix6.toInt();
      matrix6.dispose();
      return matrix7;
    });
  }

  matrixSquare9973(matrix: tf.Tensor): tf.Tensor {
    return tf.tidy(() => {
      const matrix1 = tf.matMul(matrix, matrix);
      const matrix2 = matrix1.toFloat();
      matrix1.dispose();
      const min = matrix2.min();
      const matrix3 = matrix2.sub(min);
      min.dispose();
      matrix2.dispose();
      const max = matrix3.max();
      const matrix4 = matrix3.div(max);
      max.dispose();
      matrix3.dispose();
      const matrix5 = matrix4.mul(9973);
      matrix4.dispose();
      const matrix6 = matrix5.round();
      matrix5.dispose();
      const matrix7 = matrix6.toInt();
      matrix6.dispose();
      return matrix7;
    });
  }

  reduceMatrixToVectorSum(matrix: tf.Tensor): tf.Tensor {
    return matrix.sum(1);
  }

  reduceMatrixToVectorMax(matrix: tf.Tensor): tf.Tensor {
    return matrix.max(1);
  }

  reduceMatrixToVectorMin(matrix: tf.Tensor): tf.Tensor {
    return matrix.min(1);
  }

  reduceMatrixToVectorRnd(matrix: tf.Tensor): tf.Tensor {
    let nCols = matrix.shape[1] as number;
    let nRows = matrix.shape[0] as number;
    let indices = matrix.slice([0, 0], [1, nCols]);
    indices = tf.clipByValue(indices, 0, nRows - 1);
    return matrix.gather(indices.flatten().toInt());
  }

  async matrixReduce(
    matrix: tf.Tensor,
  ): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    let reducedSum = this.reduceMatrixToVectorSum(matrix);
    let reducedMax = this.reduceMatrixToVectorMax(matrix);
    let reducedMin = this.reduceMatrixToVectorMin(matrix);
    let reducedRnd = this.reduceMatrixToVectorRnd(matrix);
    let reducedSumBuf = Buffer.from(await reducedSum.data());
    let reducedMaxBuf = Buffer.from(await reducedMax.data());
    let reducedMinBuf = Buffer.from(await reducedMin.data());
    let reducedRndBuf = Buffer.from(await reducedRnd.data());
    let reducedBufs: [Buffer, Buffer, Buffer, Buffer] = [
      reducedSumBuf,
      reducedMaxBuf,
      reducedMinBuf,
      reducedRndBuf,
    ];
    return reducedBufs;
  }

  reducedBufsHash(reducedBufs: [Buffer, Buffer, Buffer, Buffer]): Buffer {
    let hash0 = this.blake3Hash(reducedBufs[0]);
    let hash1 = this.blake3Hash(reducedBufs[1]);
    let hash2 = this.blake3Hash(reducedBufs[2]);
    let hash3 = this.blake3Hash(reducedBufs[3]);
    let concatted = Buffer.concat([hash0, hash1, hash2, hash3]);
    return this.blake3Hash(concatted);
  }

  async reducedBufsHashAsync(
    reducedBufs: [Buffer, Buffer, Buffer, Buffer],
  ): Promise<Buffer> {
    let hash0 = await this.asyncBlake3(reducedBufs[0]);
    let hash1 = await this.asyncBlake3(reducedBufs[1]);
    let hash2 = await this.asyncBlake3(reducedBufs[2]);
    let hash3 = await this.asyncBlake3(reducedBufs[3]);
    let concatted = Buffer.concat([hash0, hash1, hash2, hash3]);
    return this.asyncBlake3(concatted);
  }
}
