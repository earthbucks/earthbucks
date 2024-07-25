# EarthBucks

<img src="./earthbucks-e-2-300.png" width="150" height="150" alt="EarthBucks">

Electronic cash for everybody on Planet Earth.

Website: [earthbucks.com](https://earthbucks.com)

## Software Repository Information

This repository hosts open-source software for EarthBucks. See the LICENSE file
in each project folder for details. The primary software is the library,
implmented which provides all fundamental data structures and algorithms. Other
software is provided to run run mines, walles, and apps.

The reference implementation is TypeScript. If two implementations differ, trust
the TypeScript implementation.

## Software Packages

### TypeScript (ts)

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-pow-browser (tensorflow methods for GPU POW in the browser)
- earthbucks-pow-node (tensorflow methods for GPU POW in Node.js)


### Rust (rs)

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_pow (tensorflow methods for GPU POW)