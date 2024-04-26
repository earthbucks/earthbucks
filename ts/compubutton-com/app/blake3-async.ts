import { createHash, hash as blake3Hash, hash } from "blake3";
import { Buffer } from "buffer";

function nodeBlake3Hash(data: Buffer): Buffer {
  const hasher = createHash();
  hasher.update(data);
  return Buffer.from(hasher.digest());
}

type BufferFunction = (input: Buffer) => Buffer;
type AsyncBufferFunction = (input: Buffer) => Promise<Buffer>;
let blake3Sync: BufferFunction;
let blake3Async: AsyncBufferFunction;
let worker: Worker;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Async = async (data: Buffer) => {
    return nodeBlake3Hash(data);
  };
} else {
  // running in a browser environment
  import("blake3/browser").then(async ({ createHash, hash }) => {
    let browserBlake3Hash = (data: Buffer) => {
      const hasher = createHash();
      hasher.update(data);
      let res = Buffer.from(hasher.digest());
      return res;
    };
    blake3Sync = browserBlake3Hash;
  });

  worker = new Worker(new URL("./blake3-worker.client.ts", import.meta.url), {
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

export { blake3Sync };
export { blake3Async };
