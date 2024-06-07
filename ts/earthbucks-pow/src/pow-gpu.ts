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
    this.workingBlockId = this.tensorFromBufferBitsAlt3(workingBlockId);
    this.recentBlockIds = this.tensorFromBufferBitsAlt3(
      SysBuf.concat(previousBlockIds),
    );
  }

  tensorFromBufferBitsAlt1(buffer: SysBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    //
    // this method sends 32 times the amount of data to the GPU than strictly
    // necessary. this is why i have two other implementations below.
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

  tensorFromBufferBitsAlt2(buffer: SysBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    //
    // this method is not efficient, but it shows the basic idea of using
    // arthmetic operations to do the same thing as bitwise operations.
    const bufferIter = buffer.values();
    const bits: number[] = [];
    let bit: number | undefined;
    while ((bit = bufferIter.next().value) !== undefined) {
      for (let i = 7; i >= 0; i--) {
        const shiftedBit = Math.floor(bit / Math.pow(2, i));
        bits.push(shiftedBit % 2);
      }
    }
    return this.tf.tensor1d(bits, "int32");
  }

  tensorFromBufferBitsAlt3(buffer: SysBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    //
    // this method could be simpler with bitwise operations, but the goal is to
    // send less data to the GPU. thus it is written in a more complex way that
    // uses integer operations. these are less efficient, but it doesn't matter,
    // because it's all running on the GPU. the biggest bottleneck is the amount
    // of data sent to the GPU, not the operations performed on the GPU.
    //
    // note that we may be able to save even more bandwidth using uint16 or
    // uint32 or int32, but there are issues:
    // - with uint16, now you have to deal with endianness. using a uint16array
    //   does not allow you to specify the endianness, meaning you are dependent
    //   on the host system, whatever that is.
    // - with uint32, values are too big to be represented as int32 values.
    // - with int32, now you have negative values, which can't be computed the
    //   same way as with the positive values.
    //
    // so the simplest answer for now is to use uint8 values, i.e. Uint8Array,
    // i.e. SysBuf. that saves 8x bandwidth vs. sending each bit separately, but
    // is also simpler than uint16 or int32.

    // Convert buffer to tensor
    let bitTensor = tf.tensor1d(buffer, "int32");

    // Create array of powers of 2
    const powersOf2 = tf.tensor1d([128, 64, 32, 16, 8, 4, 2, 1], "int32");

    // Reshape tensors for broadcasting
    bitTensor = bitTensor.reshape([-1, 1]);
    const powersOf2Reshaped = powersOf2.reshape([1, -1]);

    // Perform integer division and modulus operation
    const shiftedBits = bitTensor.div(powersOf2Reshaped);
    const bits = shiftedBits.mod(tf.scalar(2, "int32"));

    // Flatten bits tensor to 1D
    const flattenedBits = bits.flatten();

    return flattenedBits;
  }

  updateWorkingBlockId(workingBlockId: SysBuf) {
    this.workingBlockId = this.tensorFromBufferBitsAlt3(workingBlockId);
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

  matrixCalculations(matrix: TFTensor, n: number) {
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
    // This method returns a specific row from the input matrix. The row index
    // is determined by the value at the first position of the matrix (0,0). The
    // value is clipped to ensure it's within the valid range of row indices.
    // The result is a 1D tensor representing the selected row. Because the
    // matrix is filled with pseudo random values from 0 to N, the chosen row is
    // also pseudo random, i.e. the result is a pseudo random vector. i.e., this
    // method returns a random row from the matrix.
    const nRows = matrix.shape[0];
    const indexTensor = matrix.slice([0, 0], [1, 1]).clipByValue(0, nRows - 1);
    return matrix.gather(indexTensor).reshape([-1]);
  }

  matrixReduce(matrix: TFTensor): TFTensor {
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
    const concatted = this.tf.concat([
      reducedSum,
      reducedMax,
      reducedMin,
      reducedRnd,
    ]);
    return concatted;
  }

  async algo(n: number): Promise<[SysBuf, SysBuf, SysBuf, SysBuf]> {
    const reduced = this.tf.tidy(() => {
      const seed = this.tensorSeedReplica(n); // expand seed to fill matrix
      const matrix = this.seedToMatrix(seed, n); // reshape seed to become matrix
      const matrix10 = this.matrixCalculations(matrix, n);
      const reduced = this.matrixReduce(matrix10);
      return reduced;
    });
    const reducedBuf = SysBuf.from(await reduced.data());
    const reducedBufs: [SysBuf, SysBuf, SysBuf, SysBuf] = [
      SysBuf.from(reducedBuf.subarray(0, n)),
      SysBuf.from(reducedBuf.subarray(n, n * 2)),
      SysBuf.from(reducedBuf.subarray(n * 2, n * 3)),
      SysBuf.from(reducedBuf.subarray(n * 3, n * 4)),
    ];
    reduced.dispose();
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
