// import { hash } from "blake3";
// import { Buffer } from "buffer";

// 1. node.js-only approach
// export function blake3Hash(data: Buffer): Buffer {
//   return hash(data) as Buffer;
// }

// export function doubleBlake3Hash(data: Buffer): Buffer {
//   return blake3Hash(blake3Hash(data));
// }

import { hash, createKeyed } from "blake3";
import { Buffer } from "buffer";
// for approach 3:
//import * as blake3browser from 'blake3/browser';
// for approach 4:
import { blake3 as blake3browser } from "@noble/hashes/blake3";

type BufferFunction = (input: Buffer) => Buffer;
type MacFunction = (key: Buffer, data: Buffer) => Buffer;

let blake3Hash: BufferFunction;
let doubleBlake3Hash: BufferFunction;
let blake3Mac: MacFunction;

if (typeof document === "undefined") {
  // running in a server environment
  blake3Hash = function blake3Hash(data: Buffer): Buffer {
    return hash(data) as Buffer;
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: Buffer, data: Buffer): Buffer {
    return createKeyed(key).update(data).digest() as Buffer;
  };
} else {
  // running in a browser environment

  // 2. inline import approach. this version is annoying because it doesn't load
  //    right away. and for some reason adding an "await" here, although it
  //    works in development, causes mysterious react errors in production.

  // import("blake3/browser").then(async ({ createHash, hash }) => {
  //   let browserBlake3Hash = (data: Buffer) => {
  //     const hasher = createHash();
  //     hasher.update(data);
  //     let res = Buffer.from(hasher.digest());
  //     return res;
  //   };
  //   let browserDoubleBlake3Hash = (data: Buffer) => {
  //     return browserBlake3Hash(browserBlake3Hash(data));
  //   }
  //   blake3Hash = browserBlake3Hash
  //   doubleBlake3Hash = browserDoubleBlake3Hash
  // })

  // 3. top-level import approach. this approach did not seem to work at all.
  //    the top-level imports only seem to work inside a web worker. i don't
  //    know why.

  // blake3Hash = function blake3Hash(data: Buffer): Buffer {
  //   return blake3browser.hash(data) as Buffer;
  //   // const hasher = blake3Browser.createHash();
  //   // hasher.update(data);
  //   // return Buffer.from(hasher.digest());
  // }
  // doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
  //   return blake3Hash(blake3Hash(data));
  // }

  // 4. pure javascript approach. this is the only approach that works reliably
  //    without having a delay in the browser. it is slower, but that doesn't
  //    really matter much most of the time. the user only needs to
  //    occassionally hash their own keys or transactions, which will not be
  //    high volume.

  // blake3Hash = function blake3Hash(data: Buffer): Buffer {
  //   let arr = blake3browser.newRegular().update(data).finalize(32, "bytes") as Array<number>;
  //   return Buffer.from(arr);
  // };

  // doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
  //   return blake3Hash(blake3Hash(data));
  // };

  // 5. second pure javascript approach with @nobel/hashes/blake3

  // import { blake3 } from '@noble/hashes/blake3';
  // All params are optional
  // const h11 = blake3('abc', { dkLen: 256, key: 'def', context: 'fji' });
  blake3Hash = function blake3Hash(data: Buffer): Buffer {
    return Buffer.from(blake3browser(data));
  };

  doubleBlake3Hash = function doubleBlake3Hash(data: Buffer): Buffer {
    return blake3Hash(blake3Hash(data));
  };

  blake3Mac = function blake3Mac(key: Buffer, data: Buffer): Buffer {
    return Buffer.from(blake3browser(data, { key: key }));
  };
}

export { blake3Hash, doubleBlake3Hash, blake3Mac };
