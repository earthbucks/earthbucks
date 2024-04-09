# OpenSPV

Simplified Payment Verification.

Website: [openspv.com](https://openspv.com)

OpenSPV is sponsored by EarthBucks.

## EarthBucks (EBX)

42 trillion coins. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

## Architecture

All protocol code is implemented in Rust (rs) and TypeScript (rs) simultaneously
with common test vectors.

rs/ts:

- lib (transactions, blocks, data structures, algorithms)
- node (full/spv, merkler, mempool, p2p web API, wallets, mysql)
- pow (CUDA, WebGL, WebGPU, CPU)
- sdk (client)

ts only:
- gui (auth, wallet, explorer, mining pool, button)

## Initial Nodes

Primary full nodes:
- earthbucks.com: mining pool (rs full node + gui)
- impstack.com: mining pool (rs full node + gui)
- satored.com: mining pool (rs full node + gui)

Additional nodes:
- buttonbucks.com: mining pool (rs full node + gui)
- impulsecash.com: mining pool (ts full node + gui)
- compubutton.com: spv wallet (ts spv node + gui)
- openspv.com: spv wallet (rs spv node + gui)