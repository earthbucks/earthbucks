import { WebBuf } from "@earthbucks/lib";
import { FixedBuf } from "@earthbucks/lib";
import * as tf from "@tensorflow/tfjs";
import { U16BE } from "@webbuf/numbers";
import { BufReader } from "@webbuf/rw";

type TF = typeof tf;
type TFTensor = tf.Tensor;

type HashFunction = (input: WebBuf) => FixedBuf<32>;
type AsyncHashFunction = (input: WebBuf) => Promise<FixedBuf<32>>;

export class PowGpu {
  workingBlockId: TFTensor;
  lch10Ids: TFTensor;
  tf: TF = tf;

  // lch10Ids: 10 recent blockheader ids: at 1 element per bit, and 256 bits per
  // blockheader id, that's 2560 elements. that is bigger than one row of the
  // matrix of the algo1627, which of course is 1627 elements long. 2560 is
  // therefore long enough to be longer than the row size of any matrix we are
  // likely to use soon. this means that when this data is wrapped around to
  // create psuedorandom data, every single row in the matrix will be unique.
  // this is important because it means that the matrix will be as random as
  // possible given a minimum amount of pseudorandom data (which has to be sent
  // over the network, not to mention to the GPU).
  constructor(workingBlockId: FixedBuf<32>, lch10Ids: FixedBuf<32>[]) {
    const lch10IdsRev = [...lch10Ids].reverse();
    this.workingBlockId = this.tensorFromBufferBitsAlt4(workingBlockId.buf);
    this.lch10Ids = this.tensorFromBufferBitsAlt4(
      WebBuf.concat(lch10IdsRev.map((id) => id.buf)),
    );
  }

  tensorFromBufferBitsAlt1(buffer: WebBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    //
    // this method sends 32 times the amount of data to the GPU than strictly
    // necessary. this is why i have three other implementations below.
    const bufferIter = buffer.values();
    const bits: number[] = [];
    let bit: number | undefined;
    bit = bufferIter.next().value;
    while (bit !== undefined) {
      for (let i = 7; i >= 0; i--) {
        bits.push((bit >> i) & 1);
      }
      bit = bufferIter.next().value;
    }
    return this.tf.tensor1d(bits, "int32");
  }

  tensorFromBufferBitsAlt2(buffer: WebBuf): TFTensor {
    // create a tensor by extracting every bit from the buffer into a new int32
    // value in a tensor. the new tensor has a bunch of int32 values that are
    // all either 0 or 1.
    //
    // this method is not efficient, but it shows the basic idea of using
    // arthmetic operations to do the same thing as bitwise operations.
    const bufferIter = buffer.values();
    const bits: number[] = [];
    let bit: number | undefined;
    bit = bufferIter.next().value;
    while (bit !== undefined) {
      for (let i = 7; i >= 0; i--) {
        const shiftedBit = Math.floor(bit / 2 ** i);
        bits.push(shiftedBit % 2);
      }
      bit = bufferIter.next().value;
    }
    return this.tf.tensor1d(bits, "int32");
  }

  tensorFromBufferBitsAlt3(buffer: WebBuf): TFTensor {
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
    let bitTensor = tf.tensor1d(buffer, "int32");
    const powersOf2 = tf.tensor1d([128, 64, 32, 16, 8, 4, 2, 1], "int32");
    bitTensor = bitTensor.reshape([-1, 1]);
    const powersOf2Reshaped = powersOf2.reshape([1, -1]);
    const shiftedBits = bitTensor.div(powersOf2Reshaped);
    const bits = shiftedBits.mod(tf.scalar(2, "int32"));
    return bits.flatten();
  }

  tensorFromBufferBitsAlt4(buffer: WebBuf): TFTensor {
    // same as tensorFromBufferBitsAlt3, but uses a Uint16Array to reduce the
    // amount of data sent to the GPU by half compared to Uint8Array.
    if (buffer.length % 2 !== 0) {
      throw new Error("buffer length must be a multiple of 2");
    }
    const u16array = new Uint16Array(buffer.length / 2);
    const bufReader = new BufReader(buffer);
    for (let i = 0; i < buffer.length; i += 2) {
      u16array[i / 2] = bufReader.readU16BE().n;
    }
    let bitTensor = tf.tensor1d(new Int32Array(u16array), "int32");
    const powersOf2 = tf.tensor1d(
      [
        32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4,
        2, 1,
      ],
      "int32",
    );
    bitTensor = bitTensor.reshape([-1, 1]);
    const powersOf2Reshaped = powersOf2.reshape([1, -1]);
    const shiftedBits = bitTensor.div(powersOf2Reshaped);
    const bits = shiftedBits.mod(tf.scalar(2, "int32"));
    return bits.flatten();
  }

  updateWorkingBlockId(workingBlockId: FixedBuf<32>) {
    this.workingBlockId = this.tensorFromBufferBitsAlt4(workingBlockId.buf);
  }

  tensorSeed(): TFTensor {
    return this.tf.concat([this.workingBlockId, this.lch10Ids]);
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

  async algo(n: number): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    const reduced = this.tf.tidy(() => {
      const seed = this.tensorSeedReplica(n); // expand seed to fill matrix
      const matrix = this.seedToMatrix(seed, n); // reshape seed to become matrix
      const matrix10 = this.tf.matMul(matrix, matrix);
      return this.matrixReduce(matrix10);
    });
    const reducedBuf = WebBuf.from(await reduced.data());
    const reducedBufs: [WebBuf, WebBuf, WebBuf, WebBuf] = [
      WebBuf.from(reducedBuf.subarray(0, n)),
      WebBuf.from(reducedBuf.subarray(n, n * 2)),
      WebBuf.from(reducedBuf.subarray(n * 2, n * 3)),
      WebBuf.from(reducedBuf.subarray(n * 3, n * 4)),
    ];
    reduced.dispose();
    return reducedBufs;
  }

  async algo257(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
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

  async algo17(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(17);
  }

  async algo1031(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(1031);
  }

  async algo1289(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(1289);
  }

  async algo1627(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(1627);
  }

  async algo9973(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(9973);
  }

  async algo46337(): Promise<[WebBuf, WebBuf, WebBuf, WebBuf]> {
    return this.algo(46337);
  }

  reducedBufsHash(
    reducedBufs: [WebBuf, WebBuf, WebBuf, WebBuf],
    blake3Hash: HashFunction,
  ): FixedBuf<32> {
    const hash0 = blake3Hash(reducedBufs[0]).buf;
    const hash1 = blake3Hash(reducedBufs[1]).buf;
    const hash2 = blake3Hash(reducedBufs[2]).buf;
    const hash3 = blake3Hash(reducedBufs[3]).buf;
    const concatted = WebBuf.concat([hash0, hash1, hash2, hash3]);
    return blake3Hash(concatted);
  }

  async reducedBufsHashAsync(
    reducedBufs: [WebBuf, WebBuf, WebBuf, WebBuf],
    blake3HashAsync: AsyncHashFunction,
  ): Promise<FixedBuf<32>> {
    const hash0 = (await blake3HashAsync(reducedBufs[0])).buf;
    const hash1 = (await blake3HashAsync(reducedBufs[1])).buf;
    const hash2 = (await blake3HashAsync(reducedBufs[2])).buf;
    const hash3 = (await blake3HashAsync(reducedBufs[3])).buf;
    const concatted = WebBuf.concat([hash0, hash1, hash2, hash3]);
    return blake3HashAsync(concatted);
  }
}
