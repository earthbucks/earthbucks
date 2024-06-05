import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";

type TF = typeof tf;
type TFTensor = tf.Tensor;

type BufferFunction = (input: Buffer) => Buffer;
type AsyncBufferFunction = (input: Buffer) => Promise<Buffer>;

export default class GpuPow {
  previousBlockIds: Buffer[];
  workingBlockId: TFTensor;
  recentBlockIds: TFTensor;
  tf: TF = tf;

  constructor(workingBlockId: Buffer, recentBlockIds: Buffer[]) {
    this.previousBlockIds = recentBlockIds;
    this.workingBlockId = this.tensorFromBufferBits(workingBlockId);
    this.recentBlockIds = this.tensorFromBufferBits(
      Buffer.concat(recentBlockIds),
    );
  }

  tensorFromBufferBits(buffer: Buffer): TFTensor {
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
    return this.tf.tensor1d(bits, "int32");
  }

  updateWorkingBlockId(workingBlockId: Buffer) {
    this.workingBlockId = this.tensorFromBufferBits(workingBlockId);
  }

  tensorSeed(): TFTensor {
    return this.tf.concat([this.workingBlockId, this.recentBlockIds]);
  }

  tensorSeedReplica(size: number) {
    let seedLength = this.tensorSeed().shape[0];
    let numTimes = Math.ceil((size * size) / seedLength);
    let result = this.tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, size * size);
    return result;
  }

  seedToMatrix(seed: TFTensor, size: number) {
    return seed.reshape([size, size]);
  }

  matrixCalculations(matrix: TFTensor, size: number): TFTensor {
    // The primary goal of this method is to perform a giant integer matrix
    // multiplication which is impractical on any hardware other than a GPU. We
    // use integers because we know they are deterministic when added.
    //
    // The secondary goal of this method is to use floating point operations to
    // spread out the values in the matrix, thus requiring the use of floating
    // point calculations, thus using a larger number of the operations
    // available on a GPU, and not just integers. Because floating points can be
    // non-deterministic if added in unpredictable order, we only perform known
    // deterministic floating point operations on each element separately.
    //
    // Why build an ASIC for this algorithm when doing so would simply replicate
    // the functionality already available on a GPU? The idea is that GPUs *are*
    // the ASICs for this computation. There should be no reason to develop an
    // ASIC when the calculations can already be performed optimally with
    // commodity hardware.
    return this.tf.tidy(() => {
      const matrix1 = this.tf.matMul(matrix, matrix); // int32 matrix square
      const matrix2 = matrix1.toFloat(); // convert to float
      matrix1.dispose();
      const min = matrix2.min();
      const matrix3 = matrix2.sub(min); // subtract min; new min is 0
      min.dispose();
      matrix2.dispose();
      const max = matrix3.max();
      const matrix4 = matrix3.div(max); // divide by max; new max is 1
      const matrix5 = matrix4.exp(); // use exp to redistribute values; new min is 1 and new max is e^1
      matrix4.dispose();
      const min2 = matrix5.min();
      const matrix6 = matrix5.sub(min2); // subtract min; new min is 0
      min2.dispose();
      matrix5.dispose();
      const max2 = matrix6.max();
      const matrix7 = matrix6.div(max2); // divide by max; new max is 1
      max2.dispose();
      matrix6.dispose();
      const matrix8 = matrix7.mul(size); // multiply by size; new max is size
      matrix7.dispose();
      const matrix9 = matrix8.round(); // round to nearest int
      matrix8.dispose();
      const matrix10 = matrix9.toInt(); // convert to int32
      matrix9.dispose();
      return matrix10;
    });
  }

  reduceMatrixToVectorSum(matrix: TFTensor): TFTensor {
    return matrix.sum(1);
  }

  reduceMatrixToVectorMax(matrix: TFTensor): TFTensor {
    return matrix.max(1);
  }

  reduceMatrixToVectorMin(matrix: TFTensor): TFTensor {
    return matrix.min(1);
  }

  reduceMatrixToVectorRnd(matrix: TFTensor): TFTensor {
    // We assume the final matrix has values between 0 and the size of the
    // matrix. This known value enables us to select a random value from each
    // row by using the value in the first column of the matrix as an index.
    // This is a pseudo-random selection, but it is deterministic and does not
    // require any additional random number generation.
    let nCols = matrix.shape[1] as number;
    let nRows = matrix.shape[0] as number;
    let indices = matrix.slice([0, 0], [1, nCols]);
    indices = this.tf.clipByValue(indices, 0, nRows - 1);
    return matrix.gather(indices.flatten().toInt());
  }

  async matrixReduce(
    matrix: TFTensor,
  ): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    // Unfortunately, it is not possible to perform hash functions using
    // TensorFlow. We need to find a way to send the result of the computation
    // back from the GPU to the CPU without using a lot of bandwidth. The idea
    // is to use four independent reduction methods: Sum, Max, Min, and Random.
    // This is like a pseudo hash function. Although they are not secure like a
    // cryptographic hash function, by using four of them, we make it very
    // unlikely to produce fake output without just doing the matrix
    // calculation. Each of these methods will reduce the matrix to a vector of
    // size N. We can then convert the vector to a buffer and send it back to
    // the CPU. The CPU can then hash the buffers to get the final result.
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

  async algo(size: number): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    let matrix = this.tf.tidy(() => {
      let seed = this.tensorSeedReplica(size);
      let matrix1 = this.seedToMatrix(seed, size);
      seed.dispose();
      let matrix2 = this.matrixCalculations(matrix1, size);
      matrix1.dispose();
      return matrix2;
    });
    let reducedBufs = await this.matrixReduce(matrix);
    this.tf.tidy(() => {
      matrix.dispose();
    });
    return reducedBufs;
  }

  async algo257(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    // Using a prime number for the size of the matrix guarantees that replicated
    // data does not repeat on subsequent rows. For instance, for 256 bits of
    // pseudorandom data, a 256x256 matrix would have the same data on every row.
    // This known pattern can be used to reduce the number of operations needed to
    // calculate the matrix. But by using a prime size, such as 257, each row has
    // unique data. This makes it non-obvious how to optimize the matrix
    // calculations, which is the point of the algorithm.
    //
    // - 17: The smallest prime number whose square is bigger than 256
    // - 257: The smallest prime number bigger than 256
    // - 1031: The smallest prime number bigger than 1024
    // - 1289: The largest prime number whose cube fits into int32
    // - 1624: The size of a matrix whose square has the same number of operations
    //   as the cube of the 1289 matrix
    // - 1627 the next highest prime number after the number 1624
    // - 9973: largest prime less than 10,000
    // - 46337: largest prime whose square is an int32
    return this.algo(257);
  }

  async algo17(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(17);
  }

  async algo1031(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(1031);
  }

  async algo1289(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(1289);
  }

  async algo1627(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(1627);
  }

  async algo9973(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(9973);
  }

  async algo46337(): Promise<[Buffer, Buffer, Buffer, Buffer]> {
    return this.algo(46337);
  }

  reducedBufsHash(
    reducedBufs: [Buffer, Buffer, Buffer, Buffer],
    blake3Hash: BufferFunction,
  ): Buffer {
    let hash0 = blake3Hash(reducedBufs[0]);
    let hash1 = blake3Hash(reducedBufs[1]);
    let hash2 = blake3Hash(reducedBufs[2]);
    let hash3 = blake3Hash(reducedBufs[3]);
    let concatted = Buffer.concat([hash0, hash1, hash2, hash3]);
    return blake3Hash(concatted);
  }

  async reducedBufsHashAsync(
    reducedBufs: [Buffer, Buffer, Buffer, Buffer],
    blake3HashAsync: AsyncBufferFunction,
  ): Promise<Buffer> {
    let hash0 = await blake3HashAsync(reducedBufs[0]);
    let hash1 = await blake3HashAsync(reducedBufs[1]);
    let hash2 = await blake3HashAsync(reducedBufs[2]);
    let hash3 = await blake3HashAsync(reducedBufs[3]);
    let concatted = Buffer.concat([hash0, hash1, hash2, hash3]);
    return blake3HashAsync(concatted);
  }
}
