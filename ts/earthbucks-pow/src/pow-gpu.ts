import { Buffer as SysBuf } from "buffer";
import * as tf from "@tensorflow/tfjs";

type TF = typeof tf;
type TFTensor = tf.Tensor;

type BufferFunction = (input: SysBuf) => SysBuf;
type AsyncBufferFunction = (input: SysBuf) => Promise<SysBuf>;

export class PowGpu {
  workingBlockId: TFTensor;
  recentBlockIds: TFTensor;
  tf: TF = tf;

  constructor(workingBlockId: SysBuf, previousBlockIds: SysBuf[]) {
    this.workingBlockId = this.tensorFromBufferBits(workingBlockId);
    this.recentBlockIds = this.tensorFromBufferBits(
      SysBuf.concat(previousBlockIds),
    );
  }

  tensorFromBufferBits(buffer: SysBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    const bufferIter = buffer.values();
    const bits: number[] = [];
    let bit: number | undefined;
    while ((bit = bufferIter.next().value) !== undefined) {
      for (let i = 7; i >= 0; i--) {
        bits.push((bit >> i) & 1);
      }
    }
    return this.tf.tensor1d(bits, "int32");
  }

  updateWorkingBlockId(workingBlockId: SysBuf) {
    this.workingBlockId = this.tensorFromBufferBits(workingBlockId);
  }

  tensorSeed(): TFTensor {
    return this.tf.concat([this.workingBlockId, this.recentBlockIds]);
  }

  tensorSeedReplica(n: number) {
    const seedLength = this.tensorSeed().shape[0];
    const numTimes = Math.ceil((n * n) / seedLength);
    let result = this.tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, n * n);
    return result;
  }

  seedToMatrix(seed: TFTensor, n: number) {
    return seed.reshape([n, n]);
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
    const nCols = matrix.shape[1] as number;
    const nRows = matrix.shape[0] as number;
    let indices = matrix.slice([0, 0], [1, nCols]);
    indices = this.tf.clipByValue(indices, 0, nRows - 1);
    return matrix.gather(indices.flatten().toInt());
  }

  async matrixReduce(
    matrix: TFTensor,
  ): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    // Unfortunately, it is not possible to perform hash functions using
    // TensorFlow. We need to find a way to send the result of the computation
    // back from the GPU to the CPU without using a lot of bandwidth. The idea
    // is to use four independent reduction methods: Sum, Max, Min, and Random.
    // This is like a pseudo hash function. Although they are not secure like a
    // cryptographic hash function, by using four of them, we make it very
    // unlikely to produce fake output without just doing the matrix
    // calculation. Each of these methods will reduce the matrix to a vector of
    // size n. We can then convert the vector to a buffer and send it back to
    // the CPU. The CPU can then hash the buffers to get the final result.
    const reducedSum = this.reduceMatrixToVectorSum(matrix);
    const reducedMax = this.reduceMatrixToVectorMax(matrix);
    const reducedMin = this.reduceMatrixToVectorMin(matrix);
    const reducedRnd = this.reduceMatrixToVectorRnd(matrix);
    const reducedSumBuf = SysBuf.from(await reducedSum.data());
    const reducedMaxBuf = SysBuf.from(await reducedMax.data());
    const reducedMinBuf = SysBuf.from(await reducedMin.data());
    const reducedRndBuf = SysBuf.from(await reducedRnd.data());
    const reducedBufs: [SysBuf, SysBuf, SysBuf, SysBuf] = [
      reducedSumBuf,
      reducedMaxBuf,
      reducedMinBuf,
      reducedRndBuf,
    ];
    return reducedBufs;
  }

  async algo(n: number): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
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
    const matrix = this.tf.tidy(() => {
      const seed = this.tensorSeedReplica(n); // expand seed to fill matrix
      const matrix = this.seedToMatrix(seed, n); // reshape seed to become matrix
      const matrix1 = this.tf.matMul(matrix, matrix); // int32 matrix square
      const matrix2 = matrix1.toFloat(); // convert to float
      const min = matrix2.min();
      const matrix3 = matrix2.sub(min); // subtract min; new min is 0
      const max = matrix3.max();
      const matrix4 = matrix3.div(max); // divide by max; new max is 1
      const matrix5 = matrix4.exp(); // use exp to redistribute values; new min is 1 and new max is e^1
      const min2 = matrix5.min();
      const matrix6 = matrix5.sub(min2); // subtract min; new min is 0
      const max2 = matrix6.max();
      const matrix7 = matrix6.div(max2); // divide by max; new max is 1
      const matrix8 = matrix7.mul(n); // multiply by N; new max is N
      const matrix9 = matrix8.round(); // round to nearest int
      const matrix10 = matrix9.toInt(); // convert to int32
      return matrix10;
    });
    const reducedBufs = await this.matrixReduce(matrix);
    this.tf.tidy(() => {
      matrix.dispose();
    });
    return reducedBufs;
  }

  async algo257(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
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

  async algo17(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(17);
  }

  async algo1031(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(1031);
  }

  async algo1289(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(1289);
  }

  async algo1627(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(1627);
  }

  async algo9973(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(9973);
  }

  async algo46337(): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    return this.algo(46337);
  }

  reducedBufsHash(
    reducedBufs: [SysBuf, SysBuf, SysBuf, SysBuf],
    blake3Hash: BufferFunction,
  ): SysBuf {
    const hash0 = blake3Hash(reducedBufs[0]);
    const hash1 = blake3Hash(reducedBufs[1]);
    const hash2 = blake3Hash(reducedBufs[2]);
    const hash3 = blake3Hash(reducedBufs[3]);
    const concatted = SysBuf.concat([hash0, hash1, hash2, hash3]);
    return blake3Hash(concatted);
  }

  async reducedBufsHashAsync(
    reducedBufs: [SysBuf, SysBuf, SysBuf, SysBuf],
    blake3HashAsync: AsyncBufferFunction,
  ): Promise<SysBuf> {
    const hash0 = await blake3HashAsync(reducedBufs[0]);
    const hash1 = await blake3HashAsync(reducedBufs[1]);
    const hash2 = await blake3HashAsync(reducedBufs[2]);
    const hash3 = await blake3HashAsync(reducedBufs[3]);
    const concatted = SysBuf.concat([hash0, hash1, hash2, hash3]);
    return blake3HashAsync(concatted);
  }
}
