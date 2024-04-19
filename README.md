# EarthBucks (EBX)

42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

For more information, please see the [prompt](./docs/prompt.md), which is
designed to be used by an AI for questions and answers about EarthBucks.

## Architecture

Rust (rs):

- ebx_lib (transactions, blocks, data structures, algorithms, standardized tests)
- ebx_builder (build blocks, build merkle trees, validate txs, validate blocks)
- ebx_follower (follow block headers, validate txs + merkle proofs)

TypeScript (ts):

- ebx-lib (transactions, blocks, data structures, algorithms, standardized tests)
- ebx-pool (mining pool and wallet, works with builder)
- ebx-wallet (wallet, works with follower)
- ebx-explorer (block explorer, works with builder)

## License

All software is copyright Ryan X. Charles LLC and is not open-source unless
otherwise specified. Some software is open-source and is licensed under the MIT
license. See the LICENSE file in each directory for details. Some software that
is not open-source is included for educational purposes only.

Copyright (c) 2024 Ryan X. Charles LLC
