# More Thoughts on Network Architecture

April 27, 2024

I have put a lot of thought into how to bootstrap this network. Currently my
plan is to start with one mining node and one wallet. I will then manually add
new nodes to the network and distribute them all over the world. Long-term, I
plan to regulate the mines to make sure they stay distributed globally. Thus,
although proof-of-work (PoW) is used in this blockchain, the block production is
also partially regulated by legal contracts.

Attached is the current network architecture I have added to the
README. This information may change before launch, but it serves as a good
outline of the plan for now:

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