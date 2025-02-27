# EarthBucks

<img src="./earthbucks-e-2-300.png" width="150" height="150" alt="EarthBucks">

Global electronic cash system.

Website: [earthbucks.com](https://earthbucks.com)

## Software Repository Information

This repository hosts open-source software for EarthBucks. See the LICENSE file
in each project folder for details. The primary software is the TypeScript
library, which provides all fundamental data structures and algorithms. Other
software is provided to run mines, wallets, and apps.

The reference implementation is TypeScript. If two implementations differ, trust
the TypeScript implementation. Rust is used primarily for performance-critical
code.

## Software Packages

### TypeScript (ts)

- npm-earthbucks-ebx-lib (transactions, blocks, data structures, algorithms,
  standardized tests)
- npm-earthbucks-mine-client (client for mines)
- npm-earthbucks-pow5 (proof-of-work algorithm)
- npm-webbuf-webbuf (binary data)
- npm-webbuf-fixedbuf (fixed-size binary data)
- npm-webbuf-\* (other webbuf packages)
- npm-webbuf (most used webbuf packages)

### Rust (rs)

- earthbucks_lib (not up-to-date! a work-in-progress rust implementation)
- earthbucks_pow5 (proof-of-work algorithm)
- earthbucks_blake3 (hashing algorithm)
- earthbucks_secp256k1 (elliptic curve cryptography)
- earthbucks_tauri (desktop app backend)
- earthbucks_aescbc (AES encryption)
- webbuf (binary data)
- webbuf_aescbc (AES encryption for webbuf)
- webbuf_blake3 (hashing for webbuf)
- webbuf_secp256k1 (elliptic curve cryptography for webbuf)

Copyright © 2025 EarthBucks Inc.
