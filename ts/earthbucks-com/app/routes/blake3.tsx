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

class Matmul {
  seed: Buffer;
  blake3Hash: BufferFunction;

  constructor(seed: Buffer, blake3Hash: BufferFunction) {
    this.seed = seed;
    this.blake3Hash = blake3Hash;
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
      let browserBlake3Hash = (data: Buffer) => {
        const hasher = createHash();
        hasher.update(data);
        return Buffer.from(hasher.digest());
      };
      let seed = Buffer.from("seed");
      let matmul = new Matmul(seed, browserBlake3Hash);
      console.time("matmul1024");
      let res = await matmul.matmul1024();
      console.timeEnd("matmul1024");
      console.log(res.toString("hex"));
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
