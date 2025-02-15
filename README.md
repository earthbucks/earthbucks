# EarthBucks

<img src="./earthbucks-e-2-300.png" width="150" height="150" alt="EarthBucks">

Electronic cash for everybody on Planet Earth.

Website: [earthbucks.com](https://earthbucks.com)

## Software Repository Information

This repository hosts open-source software for EarthBucks. See the LICENSE file
in each project folder for details. The primary software is the library, which
provides all fundamental data structures and algorithms. Other software is
provided to run mines, wallets, and apps.

The reference implementation is TypeScript. If two implementations differ, trust
the TypeScript implementation.

## Software Packages

### TypeScript (ts)

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-mine-client (client for mines)
- earthbucks-pow-browser (tensorflow methods for PoW in the browser)
- earthbucks-pow-node (tensorflow methods for PoW in Node.js on CPU)
- earthbucks-pow-node-gpu (tensorflow methods GPU PoW in Node.js on GPU)
- earthbucks-pow-validator-client (client for the PoW Validator)
- earthbucks-compubutton (the most advanced button in the world)

### Rust (rs)

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
