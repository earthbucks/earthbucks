# OpenSPV

Simplified Payment Verification.

Website: [openspv.com](https://openspv.com)

OpenSPV theoretically supports many blockchains, but for now we are focused on
the new blockchain EarthBucks (EBX).

## EarthBucks (EBX)

42 trillion coins. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

## Architecture

rs/ts:

- lib (transactions, blocks, data structures, algorithms, standardized tests)
- sdk (client for full node and spv node)

rs only:

- node (merkler, validator, mempool, p2p web API, wallets, auth, mysql)
  - block-listener (p2p listener, rpc listener)
  - block-builder (block generator, miner, gets blocks, builds merkle trees)
  - spv-builder (build chain of block headers)
  - spv-listener (listen for block headers and txs)
- server-pow (CUDA, CPU, OpenCL)
- cli (command-line interface)

ts only:

- gui (auth, wallet, explorer, mining pool, button)
- browser-pow (WebGL, WebGPU, WASM)

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

## License

All software is copyright Ryan X. Charles LLC and is not open-source unless
otherwise specified. Some software is open-source and is licensed under the MIT
license. See the LICENSE file in each directory for details. Some software that
is not open-source is included for educational purposes only.

Copyright (c) 2024 Ryan X. Charles LLC
