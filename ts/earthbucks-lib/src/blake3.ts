// import { hash } from "blake3";
// import { Buffer } from "buffer";

// export function blake3Hash(data: Buffer): Buffer {
//   return hash(data) as Buffer;
// }

// export function doubleBlake3Hash(data: Buffer): Buffer {
//   return blake3Hash(blake3Hash(data));
// }

import { hash } from "blake3";
import { Buffer } from "buffer";
import * as blake3browser from 'blake3/browser';

type BufferFunction = (input: Buffer) => Buffer;

let blake3Hash: BufferFunction

let doubleBlake3Hash: BufferFunction

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: Buffer): Buffer {
    return hash(data) as Buffer;
  }

  doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
    return blake3Hash(blake3Hash(data));
  }

} else {
  // running in a browser environment
  await import("blake3/browser").then(async ({ createHash, hash }) => {
    let browserBlake3Hash = (data: Buffer) => {
      const hasher = createHash();
      hasher.update(data);
      let res = Buffer.from(hasher.digest());
      return res;
    };
    let browserDoubleBlake3Hash = (data: Buffer) => {
      return browserBlake3Hash(browserBlake3Hash(data));
    }
    blake3Hash = browserBlake3Hash
    doubleBlake3Hash = browserDoubleBlake3Hash
  })
  // blake3Hash = function blake3Hash(data: Buffer): Buffer {
  //   return blake3browser.hash(data) as Buffer;
  //   // const hasher = blake3Browser.createHash();
  //   // hasher.update(data);
  //   // return Buffer.from(hasher.digest());
  // }

  // doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
  //   return blake3Hash(blake3Hash(data));
  // }
}

export { blake3Hash, doubleBlake3Hash }