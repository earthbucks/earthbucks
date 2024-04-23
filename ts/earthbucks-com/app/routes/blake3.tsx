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
    let bits = Buffer.alloc(2048);
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
    let tensor = tf.tensor1d(bits, "int32");
    // console.log(tensor.shape);
    return tensor;
  }

  createMatrixBits(size: number): tf.Tensor {
    let tensorBits = this.createTensorBits();
    let totalElements = size * size;
    let repeatTimes = Math.ceil(totalElements / 2048);
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

  reduceMatrixBufferSync(
    matrix: tf.Tensor,
  ): Buffer {
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

  reduceMatrixToHashSync(
    matrix: tf.Tensor,
  ): Buffer {
    let reducedXORBuf = this.reduceMatrixBufferSync(matrix);
    return this.blake3Hash(reducedXORBuf);
  }

  squareMatrix(matrix: tf.Tensor): tf.Tensor {
    return tf.matMul(matrix, matrix);
  }

  hashToMatrixToSquaredMatrixToHashSync(
    size: number,
  ): Buffer {
    let matrix = this.createMatrixBits(size);
    let squared = this.squareMatrix(matrix);
    return this.reduceMatrixToHashSync(squared);
  }

  // seed -> hash -> bits -> matrix -> square -> reduce -> hash
  //
  // all performed with a matrix whose size is 1289, which is the largest prime
  // number whose cube fits into int32. the reason why the cube matters is that
  // first we square the matrix, whose max value is 1289^2, but then we also sum
  // each column in the reduction phase, meaning the true max is a cube. to do
  // this with a larger number, you would have to use int64, which is not
  // currently supported by tensorflow.
  //
  // -> hashBitMatSquareReduceHash1289
  // -> hbmsrh1289
  hbmsrh1289(): Buffer {
    return this.hashToMatrixToSquaredMatrixToHashSync(1289);
  }
}

export const meta: MetaFunction = () => {
  return [
    { title: "EarthBucks" },
    { name: "description", content: "Welcome to EarthBucks!" },
  ];
};

export default function Landing() {
  if (typeof document === "undefined") {
    // running in a server environment
    // const res = blake3Hash(Buffer.from("test"));
    // const buf = Buffer.from(res);
    // console.log(buf.toString("hex"));
  } else {
    // running in a browser environment
    import("blake3/browser").then(async ({ createHash, hash: blake3Hash }) => {
      function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      await delay(1000);
      let browserBlake3Hash = (data: Buffer) => {
        const hasher = createHash();
        hasher.update(data);
        return Buffer.from(hasher.digest());
      };
      console.log("begin");
      // gpupow
      {
        let seed = Buffer.from("seed");
        let gpupow = new Gpupow(seed, browserBlake3Hash);
        console.time("create tensor bits");
        let tensor = gpupow.createTensorBits();
        console.timeEnd("create tensor bits");
        console.log(tensor);
        console.time("hashMatSquareHash1289");
        let res = gpupow.hbmsrh1289();
        console.timeEnd("hashMatSquareHash1289");
        console.log(res.toString("hex"));
      }
    });
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
          <Button initialText="Compute" />
        </div>
      </div>
    </div>
  );
}
