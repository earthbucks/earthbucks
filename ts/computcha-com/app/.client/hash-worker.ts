import { Buffer } from "buffer";

type BufferFunction = (input: Buffer) => Buffer;

let myBlake3Hash: BufferFunction;

// running in a browser environment
import("blake3/browser").then(async ({ createHash, hash }) => {
  let browserBlake3Hash = (data: Buffer) => {
    const hasher = createHash();
    hasher.update(data);
    return Buffer.from(hasher.digest());
  };
  myBlake3Hash = browserBlake3Hash;
});

self.onmessage = async (event) => {
  switch (event.data.type) {
    case "init":
      console.log("Worker initialized");
      break;
    case "hash":
      console.log("Worker received hash request");
      let { buf } = event.data.buf;
      let resHash = myBlake3Hash(buf);
      console.log('worker: ' + resHash.toString("hex"));
      self.postMessage({ type: "result", data: resHash });
      break;
    default:
      throw new Error(`Unrecognized message type: ${event.data.type}`);
  }
};
