# EarthBucks

<img src="./earth-coin-2.png" width="200" height="200">

42 EBX. No pre-mine. GPUs. Big blocks. Script.

Genesis block in July 2024.

Website: [earthbucks.com](https://earthbucks.com)

## Software Architecture

Rust is used to build blocks. TypeScript is used for the apps. The library is
implemented in both Rust and TypeScript.

### Rust (rs)

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_tf (tensorflow methods for GPU POW)
- earthbucks_client (works with API)
- earthbucks_builder (build blocks, build merkle trees, validate txs, validate blocks)
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

Apps:

- earthbucks-com (information, wallet)
- earthbucks-mine-1 (mine, works with builder, follower, wallet)
- earthbucks-mine-2 (mine, works with builder, follower, wallet)
- ...
- earthbucks-mine-6 (mine, works with builder, follower, wallet)

## Mining Network Architecture

There can never be more than 2016 mines because the target adjustment window is
2016 blocks, and difficulty will tend to increase every window. If a mine is
unable to produce a block in the target adjustment window, it is unlikely it
will ever produce a block. Thus, we do not waste time querying any mines who
have not produced a block in the past 2016 blocks.

Every mine is a mining pool. Wallets and users are conceptually separate from
mines. However, a mine can have a wallet and users.

The first six mines are distributed globally to make sure everyone in the world
has low latency.

The first six mines:
- 1.earthbucks.com (North America)
- 2.earthbucks.com (Europe)
- 3.earthbucks.com (Asia)
- 4.earthbucks.com (South America)
- 5.earthbucks.com (Africa)
- 6.earthbucks.com (Australasia)