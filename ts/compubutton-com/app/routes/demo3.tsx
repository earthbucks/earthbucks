import type { MetaFunction } from "@remix-run/node";
import Button from "../button";
import { createHash, hash as blake3Hash, hash } from "blake3";
import { Buffer } from "buffer";
import * as tf from "@tensorflow/tfjs";
import GpuPow from "earthbucks-tf/src/gpu-pow";

type BufferFunction = (input: Buffer) => Buffer;
type AsyncBufferFunction = (input: Buffer) => Promise<Buffer>;

function nodeBlake3Hash(data: Buffer): Buffer {
  const hasher = createHash();
  hasher.update(data);
  return Buffer.from(hasher.digest());
}

export const meta: MetaFunction = () => {
  return [
    { title: "Compubutton" },
    { name: "description", content: "Welcome to Compubutton!" },
  ];
};

export default function Landing() {
  let blake3Hash: BufferFunction;
  let blake3Async: AsyncBufferFunction;
  let worker: Worker;
  if (typeof document === "undefined") {
    // running in a server environment

    blake3Hash = nodeBlake3Hash;
    blake3Async = async (data: Buffer) => {
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

    blake3Async = async (data: Buffer) => {
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
      let gpupow = new GpuPow(
        workingBlockId,
        previousBlockIds,
      );

      for (let i = 0; i < 100; i++) {
        let workingBlockId = blake3Hash(Buffer.from("workingBlockId" + i));
        gpupow.updateWorkingBlockId(workingBlockId);
        let reducedBufs = await gpupow.algo1627();
        gpupow.reducedBufsHashAsync(reducedBufs, blake3Async).then((matrixHashBuf) => {
          console.log(matrixHashBuf.toString("hex"));
        });
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
              src="/button-logo.png"
              alt=""
              className="mx-auto mb-4 block aspect-square w-[120px] rounded-full bg-[#020a2c] p-[1px] shadow-lg shadow-[#04408d]"
            />
            <div className="hidden dark:block">
              <img
                src="/compubutton-text-white.png"
                alt="Compubutton"
                className="mx-auto block w-[300px]"
              />
            </div>
            <div className="block dark:hidden">
              <img
                src="/compubutton-text-black.png"
                alt="Compubutton"
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
