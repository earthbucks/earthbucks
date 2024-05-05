# EarthBucks

<img src="./earthbucks-coin.png" width="200" height="200">

42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Estimated launch in July.

Website: [earthbucks.com](https://earthbucks.com)

## Software Architecture

Rust is used for consensus-critical code. TypeScript is used for everything
else. The library is implemented in both Rust and TypeScript.

Rust (rs):

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_tf (tensorflow methods for GPU POW)
- earthbucks_client (works with API)
- earthbucks_builder (build blocks, build merkle trees, validate txs, validate blocks)
- earthbucks_follower (follow block headers, validate txs + merkle proofs)

TypeScript (ts):

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-blake3 (async blake3 in a web worker)
- earthbucks-tf (tensorflow methods for GPU POW)
- earthbucks-db (mysql database, works with builder, follower, pool, wallet, apps)
- earthbucks-api (works with builder and/or follower and/or wallet, via client)
- earthbucks-com (mine, information, not a wallet)
- earthbucks-wallet (wallet, works with follower)
- earthbucks-explorer (block explorer, works with builder)
- compubutton-com (button, AI, etc., not open source)
- ryanxcharles-com (KYC, not open source)

## Mining Network Architecture

There can never be more than 2016 mines because the target adjustment window is
2016 blocks, and difficulty will tend to increase every window. If a mine is
unable to produce a block in the target adjustment window, it is unlikely it
will ever produce a block. Thus, we do not waste time querying any mines who
have not produced a block in the past 2016 blocks.

Every mine is a mining pool. Wallets and users are conceptually separate from
mines. However, a mine can have a wallet and users.

Of the active mines, the network has three parts, and blocks are intentionally
distributed to all three parts.

The fraction of blocks each part gets is determined by the number of blocks in
the past 2016 target adjustment window. 1/3 blocks is 672 blocks.

The first six mines:
- 1.earthbucks.com (North America)
- 2.earthbucks.com (Europe)
- 3.earthbucks.com (Asia)
- 4.earthbucks.com (South America)
- 5.earthbucks.com (Africa)
- 6.earthbucks.com (Australasia)