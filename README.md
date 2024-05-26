# EarthBucks

<img src="./earthbucks-e-2-300.png" width="150" height="150" alt="EarthBucks">

A social network for everybody on Planet Earth.

## Launch Information

Website: [earthbucks.com](https://earthbucks.com)

## Software Architecture

### Rust (rs)

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_tf (tensorflow methods for GPU POW)
- earthbucks_client (works with API)
- earthbucks_db (mysql database, works with builder, follower, pool, wallet, apps)
- earthbucks_builder (build blocks, build merkle trees, validate txs, validate blocks)
- earthbucks_api (works with builder)
- earthbucks_follower (follow block headers, validate txs + merkle proofs)

### TypeScript (ts)

Libraries/tools:

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-blake3 (async blake3 in a web worker)
- earthbucks-tf (tensorflow methods for GPU POW)
- earthbucks-db (mysql database, works with builder, follower, pool, wallet, apps)
- earthbucks-api (works with builder and/or follower and/or wallet, via client)
- earthbucks-wallet (wallet, works with follower)
- earthbucks-explorer (block explorer, works with builder)
