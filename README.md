# EarthBucks

<img src="./earthbucks.png" width="200" height="200">

42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

For more information, please see the [prompt](./docs/prompt.md), which is
designed to be used by an AI for questions and answers about EarthBucks.

## Architecture

Rust (rs):

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_builder (build blocks, build merkle trees, validate txs, validate blocks)
- earthbucks_follower (follow block headers, validate txs + merkle proofs)

TypeScript (ts):

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-db (mysql database, works with builder, follower, pool, wallet, apps)
- earthbucks-com (main app, mining pool and wallet, works with builder, database)
- earthbucks-wallet (wallet, works with follower)
- earthbucks-explorer (block explorer, works with builder)

## License

All software is copyright Ryan X. Charles LLC and is not open-source unless
otherwise specified. Some software is open-source and is licensed under the MIT
license. See the LICENSE file in each directory for details. Some software that
is not open-source is included for educational purposes only.

Copyright (c) 2024 Ryan X. Charles LLC