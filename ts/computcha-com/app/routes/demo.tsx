import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { createHash, hash as blake3Hash, hash } from "blake3";
import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";

type BufferFunction = (input: Buffer) => Buffer;
type AsyncBufferFunction = (input: Buffer) => Promise<Buffer>;

function nodeBlake3Hash(data: Buffer): Buffer {
  const hasher = createHash();
  hasher.update(data);
  return Buffer.from(hasher.digest());
}

class Gpupow {
  workingBlockId: Buffer;
  previousBlockIds: Buffer[];
  workingTensor: tf.Tensor;
  previousTensor: tf.Tensor;
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
    this.workingTensor = this.tensorFromBufferBits(workingBlockId);
    this.previousTensor = this.tensorFromBufferBits(
      Buffer.concat(previousBlockIds),
    );
    this.blake3Hash = blake3Hash;
    this.asyncBlake3 = asyncBlake3;
  }

  updateWorkingBlockId(workingBlockId: Buffer) {
    this.workingBlockId = workingBlockId;
    this.workingTensor = this.tensorFromBufferBits(workingBlockId);
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
    return tf.concat([this.workingTensor, this.previousTensor]);
  }

  tensorSeed1289(): tf.Tensor {
    const seedLength = this.tensorSeed().shape[0];
    const numTimes = Math.ceil((1289 * 1289) / seedLength);
    let result = tf.tile(this.tensorSeed(), [numTimes]);
    result = result.slice(0, 1289 * 1289);
    return result;
  }

  seedToMatrix(seed: tf.Tensor): tf.Tensor {
    return seed.reshape([1289, 1289]);
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

  matrixCalculation(matrix: tf.Tensor): tf.Tensor {
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

export const meta: MetaFunction = () => {
  return [
    { title: "Computcha" },
    { name: "description", content: "Welcome to Computcha!" },
  ];
};

export default function Landing() {
  let blake3Hash: BufferFunction;
  let asyncBlake3: AsyncBufferFunction;
  let worker: Worker;
  if (typeof document === "undefined") {
    // running in a server environment

    blake3Hash = nodeBlake3Hash;
    asyncBlake3 = async (data: Buffer) => {
      return blake3Hash(data);
    };
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

    worker = new Worker(new URL("../.client/hash-worker.ts", import.meta.url), {
      type: "module",
    });

    async function hashInWorker(buf: Buffer): Promise<Buffer> {
      return new Promise((resolve) => {
        worker.postMessage({ type: "hash", buf });
        worker.onmessage = (event) => {
          let buf = Buffer.from(event.data.data);
          resolve(buf);
        };
      });
    }

    asyncBlake3 = async (data: Buffer) => {
      return hashInWorker(data);
    };
  }

  async function onComputing() {
    console.log("begin");
    // gpupow matrixCalculationFloat
    {
      console.time("gpupow matrixCalculationFloat");
      let previousBlockIds = [blake3Hash(Buffer.from("previousBlockId"))];
      let workingBlockId = blake3Hash(Buffer.from("workingBlockId"));
      let gpupow = new Gpupow(
        workingBlockId,
        previousBlockIds,
        blake3Hash,
        asyncBlake3,
      );
      for (let i = 0; i < 100; i++) {
        let workingBlockId = blake3Hash(Buffer.from("workingBlockId" + i));
        gpupow.updateWorkingBlockId(workingBlockId);
        let seed1289 = gpupow.tensorSeed1289();
        let matrix = gpupow.seedToMatrix(seed1289);
        matrix = gpupow.matrixCalculation(matrix);
        let reducedBufs = await gpupow.matrixReduce(matrix);
        gpupow.reducedBufsHashAsync(reducedBufs).then((matrixHashBuf) => {
          console.log(matrixHashBuf.toString("hex"));
        });
        // let matrixHashBuf = gpupow.reducedBufsHash(reducedBufs)
        // console.log(matrixHashBuf.toString("hex"))
      }
      console.timeEnd("gpupow matrixCalculationFloat");
    }
    console.log("end");
  }
  return (
    <div className="">
      <div className="mb-4 mt-4 flex">
        <div className="mx-auto">
          <div className="inline-block align-middle">
            <img
              src="/computcha-logo.png"
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src="/computcha-text-white.png"
                alt="Computcha"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/computcha-text-black.png"
                alt="Computcha"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="mt-4 text-center text-black dark:text-white">
              EarthBucks proof-of-GPU demonstration.
              <br />
              Watch your browser console.
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 mt-4 h-[80px]">
        <div className="mx-auto w-[320px]">
          <Button initialText="Compute" onComputing={onComputing} />
        </div>
      </div>
    </div>
  );
}
