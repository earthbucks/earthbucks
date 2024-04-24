import { Buffer } from "buffer";
import * as blake3browser from "blake3/browser";
let { createHash, hash } = blake3browser;

type BufferFunction = (input: Buffer) => Buffer;

let myBlake3Hash: BufferFunction;

let browserBlake3Hash = (data: Buffer) => {
  const hasher = createHash();
  hasher.update(data);
  return Buffer.from(hasher.digest());
};
myBlake3Hash = browserBlake3Hash;

self.onmessage = async (event) => {
  switch (event.data.type) {
    case "init":
      // console.log("Worker initialized");
      break;
    case "hash":
      //console.log("Worker received hash request");
      let { buf } = event.data;
      //console.log("worker: " + buf.toString());
      let resHash = myBlake3Hash(buf);
      // let resHash = buf;
      //console.log("worker: " + resHash.toString("hex"));
      self.postMessage({ type: "result", data: resHash });
      break;
    default:
      throw new Error(`Unrecognized message type: ${event.data.type}`);
  }
};
