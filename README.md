# EarthBucks

<img src="./earthbucks.png" width="200" height="200">

42 trillion EBX. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

For more information, please see the [prompt](./docs/prompt.md), which is
designed to be used by an AI for questions and answers about EarthBucks.

## Software Architecture

Rust (rs):

- earthbucks_lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks_builder (build blocks, build merkle trees, validate txs, validate blocks)
- earthbucks_follower (follow block headers, validate txs + merkle proofs)

TypeScript (ts):

- earthbucks-lib (transactions, blocks, data structures, algorithms, standardized tests)
- earthbucks-db (mysql database, works with builder, follower, pool, wallet, apps)
- earthbucks-com (main app, mining pool and wallet, works with builder, database)
- earthbucks-builder-api (builder api, works with builder)
- earthbucks-follower-api (follower api, works with follower)
- earthbucks-wallet (wallet, works with follower)
- earthbucks-explorer (block explorer, works with builder)

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

Part 1:
- "The first node"
- ryanxcharles.com (KYC)
- compubutton.com (wallet)
- earthbucks.com (mine)
- At least 1/3 blocks in perpetuity.

Part 2:
- "Global nodes" / "Sextant nodes" / "Permissioned nodes"
- Guarantee connectivity of some nodes in each global sextant
- Must pass RXC KYC
- No more than 1/3 blocks
- No more than two per country
- No more than 200 total
- North America (>= 2)
- South America (>= 2)
- Europe (>= 2)
- Africa (>= 2)
- Asia (>= 2)
- Australia (>= 2)

Part 3:
- "Free market nodes" / "Permissionless nodes"
- No KYC
- Must agree to ToS
- No more than 1/3 blocks

Ryan X. Charles