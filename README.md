# EarthBucks

<img src="./earthbucks-e-2-300.png" width="150" height="150" alt="EarthBucks">

Small casual transactions for everybody on Planet Earth.

Website: [earthbucks.com](https://earthbucks.com)

## Software Repository Information

This repository hosts open-source software for EarthBucks. See the LICENSE file
in each project folder for details. The primary software is the library,
implmented in both Rust and TypeScript, which provides all fundamental data
structures and algorithms. Other software is provided to run run mines, walles,
and apps.

## Software Packages

Rust is the reference implementation. A lot of software is also re-implemented
in TypeScript both as a check on the Rust code and also to make building web
apps easier. Other code is TypeScript only if it is only for building web apps.

### Rust (rs)

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_pow (tensorflow methods for GPU POW)
- earthbucks_mine (build/validate blocks, database, API for mines, API for wallets)
- earthbucks_archive (archive all blocks / transactions)
- earthbucks_spv (SPV node, wallet, follows mines)

### TypeScript (ts)

Re-implementations:

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-pow (tensorflow methods for GPU POW)
- earthbucks-mine (build/validate blocks, database, API for mines, API for wallets)
- earthbucks-archive (archive all blocks / transactions)
- earthbucks-spv (SPV node, wallet, follows mines)

Web apps:

- earthbucks-blake3 (async blake3 in a web worker)
- earthbucks-mine-ui
- earthbucks-archive-ui
- earthbucks-spv-ui
