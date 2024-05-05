# Library Prototype and Software Architecture Plan

April 10, 2024

The library, which builds, signs, verifies transactions and builds blocks, and
is simultaneously written in rust and typescript, is now finished in prototype
form. I am moving on to build the node software, which will be written in rust
only.

You can find all software contained inside OpenSPV (openspv.com). Theoretically,
OpenSPV could support multiple blockchains in the future. For now, it is focused
completely on EarthBucks.

The plan, for now, is that node software will be rust, and an SDK will be
written in typescript. The final piece to the puzzle will be mining pool GUI
written in typescript. Every "full node" is actually a mining pool at a domain
name. While the fundamental architecture of this chain is the same as the
original Bitcoin, the p2p protocol will be completely different and based on the
internet as it is today, not 2008.

Ryan X. Charles