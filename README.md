# OpenEBX

Open-source implementation of EarthBucks (EBX) blockchain.

Website: [openebx.com](https://openebx.com)

## EarthBucks (EBX)

42 trillion coins. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

Website: [earthbucks.com](https://earthbucks.com)

## Architecture

rs/ts:

- lib (transactions, blocks, data structures, algorithms, standardized tests)
- db (mysql, blocks, transactions, addresses, wallets, users)
- sdk (client for full node and spv node)

rs only:

- chain-builder (full node, validate txs, validate blocks, build merkle trees)
- chain-follower (spv node, validate headers, validate txs + merkle proofs)
- server-pow (CUDA, CPU, OpenCL)
- cli (command-line interface)

ts only:

- api (rest, auth, wallet, explorer, mining pool)
- gui (auth, wallet, explorer, mining pool, button)
- browser-pow (WebGL, WebGPU, WASM)

## Initial Nodes

Primary full nodes:

- earthbucks.com: mining pool (rs full node + gui)
- openebx.com: spv wallet (rs full node + gui)
- ebxbutton.com: mining pool (rs full node + gui)
- ebxpay.com: mining pool (rs full node + gui)
- ebxexchange.com: mining pool (rs full node + gui)
- ebxex.com: mining pool (rs full node + gui)

Additional nodes:

- buttonbucks.com: mining pool (rs full node + gui)
- compubutton.com: spv wallet (ts spv node + gui)
- impulsecash.com: mining pool (rs full node + gui)
- impstack.com: mining pool (rs full node + gui)
- satored.com: mining pool (rs full node + gui)

## License

All software is copyright Ryan X. Charles and is not open-source unless
otherwise specified. Some software is open-source and is licensed under the MIT
license. See the LICENSE file in each directory for details. Some software that
is not open-source is included for educational purposes only.

Copyright (c) 2024 Ryan X. Charles
