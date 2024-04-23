import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { createHash, hash as blake3Hash } from "blake3";
import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";

type BufferFunction = (input: Buffer) => Buffer;

function nodeBlake3Hash(data: Buffer): Buffer {
  const hasher = createHash();
  hasher.update(data);
  return Buffer.from(hasher.digest());
}

class Gpupow {
  seed: Buffer;
  blake3Hash: BufferFunction;

  constructor(seed: Buffer, blake3Hash: BufferFunction) {
    this.seed = seed;
    this.blake3Hash = blake3Hash;
  }

  createHashBits(): Buffer {
    let currentHash = this.blake3Hash(this.seed);
    let hashIter = currentHash.values();
    let bits = Buffer.alloc(256);
    for (let i = 0; i < 32; i++) {
      let byte = hashIter.next().value;
      if (byte === undefined) {
        currentHash = Buffer.from(currentHash);
        hashIter = currentHash.values();
        byte = hashIter.next().value;
      }
      for (let bit = 7; bit >= 0; bit--) {
        let value = (byte >> bit) & 1;
        bits[i * 8 + (7 - bit)] = value;
      }
    }
    return bits;
  }

  createTensorBits(): tf.Tensor {
    let bits = this.createHashBits();

    // interprets ever value in the buffer as a separate int32
    let tensor = tf.tensor1d(bits, "int32");

    {
      let count0 = tf.sum(tf.equal(tensor, 0)).dataSync();
      console.log("tensor count0: " + count0);

      let count1 = tf.sum(tf.equal(tensor, 1)).dataSync();
      console.log("tensor count1: " + count1);
    }
    return tensor;
  }

  createMatrixBits(size: number): tf.Tensor {
    let tensorBits = this.createTensorBits();
    let totalElements = size * size;
    let repeatTimes = Math.ceil(totalElements / 256);
    let longTensor = tf.tile(tensorBits, [repeatTimes]); // Repeat the tensor to have at least 'totalElements' elements
    let longTensorSliced = longTensor.slice(0, totalElements); // Truncate the tensor to have exactly 'totalElements' elements
    let matrix = longTensorSliced.reshape([size, size]); // Reshape the tensor into a matrix
    return matrix;
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
    // - gather the first row of the matrix
    // - each element of the first row is an index to gather from the
    //   corresponding column
    //
    // this works in the case of squaring a binary matrix, because the minimum
    // value is zero, and the maximum value is the number of rows
    let nCols = matrix.shape[1] as number;
    let nRows = matrix.shape[0] as number;
    let indices = matrix.slice([0, 0], [1, nCols]);
    indices = tf.clipByValue(indices, 0, nRows - 1);
    return matrix.gather(indices.flatten().toInt());
  }

  xorInChunks(buffer: Buffer): Buffer {
    // take in a buffer of arbitrary length, and xor it to itself in chunks of 256
    // bits (32 bytes)
    let chunkSize = 32;
    let chunks = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
      let chunk = buffer.subarray(i, i + chunkSize);
      chunks.push(chunk);
    }
    let result = Buffer.alloc(chunkSize);
    for (let chunk of chunks) {
      for (let i = 0; i < chunk.length; i++) {
        result[i] ^= chunk[i] as number;
      }
    }
    return result;
  }

  xorInChunksAlt(buffer: Buffer): Buffer {
    // take in a buffer of arbitrary length, and xor it to itself in chunks of 256
    // bits (32 bytes). testing reveals this is not any faster than the other
    // version.
    let chunkSize = 32;
    let result = Buffer.alloc(chunkSize);
    for (let i = 0; i < buffer.length; i += chunkSize) {
      let chunk = buffer.subarray(i, i + chunkSize);
      for (let j = 0; j < chunk.length; j++) {
        result[j] ^= chunk[j] as number;
      }
    }
    return result;
  }

  reduceMatrixBufferSync(matrix: tf.Tensor): Buffer {
    // the reason for reducing with these four operations is as follows. first
    // of all, what i would like to do is to hash the output matrix and then
    // send that back to the CPU. unfortuantely, GPUs do not really have that,
    // and tensorflow in particular does not support any hash functions. what i
    // want is to send the result of the matrix calculation back to the CPU
    // without sending the entire thing. how can i reduce the data, while also
    // being sure that the output is unique, and is very unlikely to be the same
    // for two different random inputs? instead of using a hash function, i thus
    // approximate a hash function by using four independent reduction methods.
    // the first is to sum all the elements of the matrix. the second is to take
    // the maximum of each row. the third is to take the minimum of each row.
    // the fourth is to take a random element from each row. the output is then
    // the concatenation of the four reductions. this is not a hash function,
    // but it is a way to reduce the data while also being sure that the output
    // is unique.
    //
    // there are other methods i could have added, such as standard deviation,
    // variance, or mean, but all of those do not actually add any information
    // to the four reduction methods provided here. instead, they are just
    // different ways of expressing the same information (e.g., both std dev,
    // var, and mean all require computing the sum first). the four reduction
    // methods provided here are independent of each other, and thus provide a
    // unique way to reduce the data. they are also as comprehensive as i can
    // figure to make it without having a hash function provided by tensorflow.
    //
    // one final advantage of these methods is that they are all highly
    // parallelizable (each column can be computed independently, and thus for
    // an NxN matrix, we have N independent threads), and thus are also suitable
    // to computation on a GPU.
    let reducedSum = this.reduceMatrixToVectorSum(matrix);
    let reducedMax = this.reduceMatrixToVectorMax(matrix);
    let reducedMin = this.reduceMatrixToVectorMin(matrix);
    let reducedRnd = this.reduceMatrixToVectorRnd(matrix);
    let reducedSumBuf = Buffer.from(reducedSum.dataSync());
    let reducedMaxBuf = Buffer.from(reducedMax.dataSync());
    let reducedMinBuf = Buffer.from(reducedMin.dataSync());
    let reducedRndBuf = Buffer.from(reducedRnd.dataSync());
    let reducedBuf = Buffer.concat([
      reducedSumBuf,
      reducedMaxBuf,
      reducedMinBuf,
      reducedRndBuf,
    ]);
    return reducedBuf;
  }

  async reduceMatrixBufferAsync(matrix: tf.Tensor): Promise<Buffer> {
    let reducedSum = this.reduceMatrixToVectorSum(matrix);
    let reducedMax = this.reduceMatrixToVectorMax(matrix);
    let reducedMin = this.reduceMatrixToVectorMin(matrix);
    let reducedRnd = this.reduceMatrixToVectorRnd(matrix);
    let reducedSumBuf = Buffer.from(await reducedSum.data());
    let reducedMaxBuf = Buffer.from(await reducedMax.data());
    let reducedMinBuf = Buffer.from(await reducedMin.data());
    let reducedRndBuf = Buffer.from(await reducedRnd.data());
    let reducedBuf = Buffer.concat([
      reducedSumBuf,
      reducedMaxBuf,
      reducedMinBuf,
      reducedRndBuf,
    ]);
    return reducedBuf;
  }

  reduceMatrixToHashSync(matrix: tf.Tensor): Buffer {
    let reducedBuf = this.reduceMatrixBufferSync(matrix);
    let xorBuf = this.xorInChunks(reducedBuf);
    let hash = this.blake3Hash(xorBuf);
    return hash;
  }

  async reduceMatrixToHashAsync(matrix: tf.Tensor): Promise<Buffer> {
    let reducedBuf = await this.reduceMatrixBufferAsync(matrix);
    let xorBuf = this.xorInChunks(reducedBuf);
    let hash = this.blake3Hash(xorBuf);
    return hash;
  }

  // takes in a binary matrix of size 1289 and returns a different binary matrix
  // of size 1289 after doing a bunch of work on it. 1289 is the largest prime P
  // such that a matrix of size PxP can be squared using int32.
  workOnMatrix(binaryMatrix1289: tf.Tensor): tf.Tensor {
    // Set the precision of floating point operations to 32-bit
    tf.ENV.set("WEBGL_PACK", false);
    tf.ENV.set("WEBGL_RENDER_FLOAT32_ENABLED", true);

    // Check if 32-bit floating point textures are supported
    if (!tf.ENV.getBool("WEBGL_RENDER_FLOAT32_ENABLED")) {
      throw new Error(
        "This function requires 32-bit floating point textures, which are not supported on this system.",
      );
    }

    // {
    //   let count0 = tf.sum(tf.equal(binaryMatrix1289, 0)).dataSync();
    //   console.log("binaryMatrix1289 count0: " + count0);

    //   let count1 = tf.sum(tf.equal(binaryMatrix1289, 1)).dataSync();
    //   console.log("binaryMatrix1289 count1: " + count1);
    // }

    // integer operations
    let squaredMatrix = tf.matMul(binaryMatrix1289, binaryMatrix1289);
    // {
    //   // theoretical: 1289
    //   // actual:      15
    //   let max = squaredMatrix.max();
    //   console.log("squaredMatrix max: " + max.dataSync());

    //   let count0 = tf.sum(tf.equal(squaredMatrix, 0)).dataSync();
    //   console.log("squaredMatrix count0: " + count0);

    //   let count1 = tf.sum(tf.equal(squaredMatrix, 1)).dataSync();
    //   console.log("squaredMatrix count1: " + count1);
    // }
    // return squaredMatrix;

    // floating point operations
    let floatMatrix = squaredMatrix.toFloat(); // max element size: 1289^2
    // {
    //   // theoretical: 1289
    //   // actual:      15
    //   let max = floatMatrix.max();
    //   console.log("floatMatrix max: " + max.dataSync());

    //   let count0 = tf.sum(tf.equal(floatMatrix, 0)).dataSync();
    //   console.log("floatMatrix count0: " + count0);
    // }
    let squareFloatMatrix = tf.matMul(floatMatrix, floatMatrix); // max element size: 1289^3
    // {
    //   // theoretical: 2,141,700,569 = 1289^3
    //   // actual:      52,835
    //   let max = squareFloatMatrix.max();
    //   console.log("squareFloatMatrix max: " + max.dataSync());

    //   let min = squareFloatMatrix.min();
    //   console.log("squareFloatMatrix min: " + min.dataSync());

    //   let count0 = tf.sum(tf.equal(squareFloatMatrix, 0)).dataSync();
    //   console.log("squareFloatMatrix count0: " + count0);
    // }
    let min = squareFloatMatrix.min();
    let subMinMatrix = squareFloatMatrix.sub(min);
    let max = subMinMatrix.max();
    let divMatrix = subMinMatrix.div(max);
    // {
    //   // theoretical: 1
    //   // actual:      1
    //   let max = divMatrix.max();
    //   console.log("divMatrix max: " + max.dataSync());

    //   // theoretical: 0
    //   // actual:      0
    //   let min = divMatrix.min();
    //   console.log("divMatrix min: " + min.dataSync());

    //   let count0 = tf.sum(tf.equal(divMatrix, 0)).dataSync();
    //   console.log("divMatrix count0: " + count0);

    //   let count1 = tf.sum(tf.equal(divMatrix, 1)).dataSync();
    //   console.log("divMatrix count1: " + count1);
      
    //   let mean = tf.mean(divMatrix);
    //   console.log("divMatrix mean: " + mean.dataSync());    
    // }

    // coerce the floating point matrix to integers
    let roundedMatrix = divMatrix.round();
    let intMatrix = roundedMatrix.toInt();
    // {
    //   // theoretical: 830760
    //   // actual:      1016362
    //   let count1 = tf.sum(tf.equal(intMatrix, 1)).dataSync();
    //   console.log("intMatrix count1: " + count1);

    //   // theoretical: 830760
    //   // actual:      645159
    //   let count0 = tf.sum(tf.equal(intMatrix, 0)).dataSync();
    //   console.log("intMatrix count0: " + count0);

    //   let max = intMatrix.max();
    //   console.log("intMatrix max: " + max.dataSync());

    //   let min = intMatrix.min();
    //   console.log("intMatrix min: " + min.dataSync());
    // }

    // // square again
    // let squaredMatrix2 = tf.matMul(intMatrix, intMatrix);

    // {
    //   // theoretical: 0
    //   // actual:      451522
    //   let equalElements = tf.equal(squaredMatrix, squaredMatrix2);
    //   let count = tf.sum(equalElements).dataSync();
    //   console.log("squaredMatrix2 count equal: " + count);

    //   let count0 = tf.sum(tf.equal(squaredMatrix2, 0)).dataSync();
    //   console.log("squaredMatrix2 count0: " + count0);

    //   let count1 = tf.sum(tf.equal(squaredMatrix2, 1)).dataSync();
    //   console.log("squaredMatrix2 count1: " + count1);

    //   let max = squaredMatrix2.max();
    //   console.log("squaredMatrix2 max: " + max.dataSync());

    //   let min = squaredMatrix2.min();
    //   console.log("squaredMatrix2 min: " + min.dataSync());
    // }

    // return squaredMatrix2;

    return intMatrix;
  }

  async float1289(): Promise<Buffer> {
    let matrix = this.createMatrixBits(1289);
    // // test: create a matrix of 1289x1289 of all ones
    // let matrix = tf.ones([1289, 1289]);

    for (let i = 0; i < 1000; i++) {
      matrix = this.workOnMatrix(matrix);
    }
    return this.reduceMatrixToHashAsync(matrix);
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Landing() {
  let blake3Hash: BufferFunction;
  if (typeof document === "undefined") {
    // running in a server environment
    blake3Hash = nodeBlake3Hash;
  } else {
    // running in a browser environment
    import("blake3/browser").then(async ({ createHash, hash }) => {
      let browserBlake3Hash = (data: Buffer) => {
        const hasher = createHash();
        hasher.update(data);
        return Buffer.from(hasher.digest());
      };
      blake3Hash = browserBlake3Hash;
    });
  }

  async function onProcessing() {
    console.log("begin");
    // gpupow int1289
    {
      // let seed = Buffer.from("seed");
      let seed = Buffer.from("seed");
      let gpupow = new Gpupow(seed, blake3Hash);
      console.time("int1289");
      let promises: Promise<Buffer>[] = [];
      for (let i = 0; i < 1; i++) {
        promises.push(gpupow.float1289());
      }
      await Promise.all(promises);
      console.timeEnd("int1289");
    }

    console.log("end");
  }
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/earthbucks-coin.png"
              alt=""
              className="mx-auto mb-4 block h-[200px] w-[200px] rounded-full bg-[#6d3206] shadow-lg shadow-[#6d3206]"
            />
            <div className="hidden dark:block">
              <img
                src="/earthbucks-text-white.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/earthbucks-text-black.png"
                alt="EarthBucks"
                className="mx-auto block h-[50px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4 text-center text-black dark:text-white">
        42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.
        <br />
        <br />
        Take the math test to register or log in.
      </div>
      <div className="mb-4 mt-4 h-[80px]">
        <div className="mx-auto w-[320px]">
          <Button initialText="Compute" onProcessing={onProcessing} />
        </div>
      </div>
    </div>
  );
}
