# SatoRed (Satoshi's Redemption)

42 million ninjas. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

[satored.com](https://satored.com)

## Architectural Overview

The goal is to recreate the architecture of Bitcoin as described by Satoshi
Nakamoto in the original Bitcoin white paper and in the original Bitcoin source
code. The most important quality we are restoring is an unlimited maximum block
size. However, we will be making changes to parameters such as using a
proof-of-work function that runs on GPUS and is ASIC-resistant to ensure
enthusiasts can mine the coin.

The architecture here is a high-level first-pass. We are not just building a C++
node software. We will implement some code in Rust, and if possible and
practical, all of it in Rust. Some code is actually best written in TypeScript
so that we can build full-stack developer tools to build apps. This is not just
a node. It is all the libraries and APIs that app builders need to build any
kind of app on any platform.

### C++

- [ ] Script interpreter
- [ ] Transaction builder
- [ ] Transaction verifier
- [ ] Block builder
- [ ] Block verifier
- [ ] Block miner
- [ ] Merkle proof builder

### Rust

- [ ] Script interpreter
- [ ] Transaction builder
- [ ] Transaction verifier
- [ ] Block builder
- [ ] Block verifier
- [ ] Block miner
- [ ] Merkle proof builder

### TypeScript (JavaScript)

- [ ] Script interpreter
- [ ] Transaction builder
- [ ] Transaction verifier
- [ ] Merkle proof verifier
- [ ] P2P transactions
- [ ] P2P blocks
- [ ] P2P block headers

## Names

- `credit` - The smallest value. (The analog of a satoshi on Bitcoin.)
- `ninja` - 1 Ninja = 10^8 credits. (The analog of 1 bitcoin.)
- `satoshi` - 10^6 ninjas = 10^14 credits. (The analog of 1 million bitcoin.)