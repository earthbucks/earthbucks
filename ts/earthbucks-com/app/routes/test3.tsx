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
  workingBlockId: Buffer;
  previousBlockIds: Buffer[];
  workingTensor: tf.Tensor;
  previousTensor: tf.Tensor;
  blake3Hash: BufferFunction;

  constructor(
    workingBlockId: Buffer,
    previousBlockIds: Buffer[],
    blake3Hash: BufferFunction,
  ) {
    this.workingBlockId = workingBlockId;
    this.previousBlockIds = previousBlockIds;
    this.workingTensor = this.tensorFromBufferBits(workingBlockId);
    this.previousTensor = this.tensorFromBufferBits(
      Buffer.concat(previousBlockIds),
    );
    this.blake3Hash = blake3Hash;
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

  matrixCalculation(matrix: tf.Tensor): tf.Tensor {
    let matrix1 = tf.matMul(tf.matMul(matrix, matrix), matrix);
    let matrix2 = matrix1.toFloat();
    let matrix3 = matrix2.sub(matrix2.min());
    let matrix4 = matrix3.div(matrix3.max());
    let matrix5 = tf.matMul(tf.matMul(matrix4, matrix4), matrix4);
    let matrix6 = matrix5.div(1289);
    let matrix7 = matrix6.round();
    let matrix8 = matrix7.toInt();
    return matrix8;
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

  async matrixReduce(matrix: tf.Tensor): Promise<[Buffer, Buffer, Buffer, Buffer]> {
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

  async matrixHash(matrix: tf.Tensor): Promise<Buffer> {
    let reducedBufs = await this.matrixReduce(matrix);
    let hash0 = this.blake3Hash(reducedBufs[0]);
    let hash1 = this.blake3Hash(reducedBufs[1]);
    let hash2 = this.blake3Hash(reducedBufs[2]);
    let hash3 = this.blake3Hash(reducedBufs[3]);
    let xorHash = Buffer.concat([hash0, hash1, hash2, hash3])
    return this.blake3Hash(xorHash);
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
    // gpupow matrixHash
    {
      let previousBlockIds = [blake3Hash(Buffer.from("previousBlockId"))];
      let workingBlockId = blake3Hash(Buffer.from("workingBlockId"));
      let gpupow = new Gpupow(workingBlockId, previousBlockIds, blake3Hash);
      for (let i = 0; i < 10; i++) {
        console.time("blake3");
        let workingBlockId = blake3Hash(Buffer.from("workingBlockId" + i));
        console.timeEnd("blake3");
        gpupow.updateWorkingBlockId(workingBlockId);
        let seed = gpupow.tensorSeed();
        let seed1289 = gpupow.tensorSeed1289();
        let matrix = gpupow.seedToMatrix(seed1289);
        matrix = gpupow.matrixCalculation(matrix);
        let reducedBuf = await gpupow.matrixReduce(matrix);
        console.time("matrixReduce");
        let matrixHashBuf = await gpupow.matrixHash(matrix);
        console.timeEnd("matrixReduce");
      }
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
