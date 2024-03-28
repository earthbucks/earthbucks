# SatoRed (Satoshi's Redemption)

42 million ninjas. No pre-mine. GPUs. Big blocks. Script.

Genesis block in 2024.

[satored.com](https://satored.com)

## Architectural Overview

The goal is to recreate the architecture of Bitcoin as described by Satoshi
Nakamoto in the original Bitcoin white paper and in the original Bitcoin source
code. The most important quality we are restoring is an unlimited maximum block
size. However, we will be making changes to parameters such as using a
proof-of-work function that runs on GPUs and is ASIC-resistant to ensure
enthusiasts can mine the coin at the start.

What if Bitcoin launched in 2024? 🤔

This is not just a node. It is also all of the libraries and APIs necessary to
build apps. It is being written in both Rust and TypeScript simultaneously.

### Rust

- [ ] Script interpreter
- [ ] Transaction builder
- [ ] Transaction verifier
- [ ] Block builder
- [ ] Block verifier
- [ ] Block miner
- [ ] Merkle proof builder
- [ ] P2P blocks
- [ ] P2P block headers
- [ ] P2P transactions

### TypeScript (JavaScript)

- [ ] Script interpreter
- [ ] Transaction builder
- [ ] Transaction verifier
- [ ] Merkle proof verifier
- [ ] P2P transactions
- [ ] P2P block headers

## Names

### "Ninja" theme

- `token` - The smallest value. (The analog of a satoshi on Bitcoin.)
- `kilotoken` - 10^3 tokens.
- `megatoken` - 10^6 tokens.
- `ninjatoken` - 10^8 tokens. (The analog of a bitcoin on Bitcoin.)
- `gigatoken` - 10^9 tokens.
- `teratoken` - 10^12 tokens.
- `satoshi` - 10^14 tokens = 10^6 ninjatokens. (One million ninjatokens.)

Ticker symbol: NJA (one ninjatoken).

### "Button" theme

- `button` - The smallest value. (The analog of a satoshi on Bitcoin.)
- `kilobutton` - 10^3 buttons.
- `megabutton` - 10^6 buttons.
- `ninjabutton` - 10^8 buttons. (The analog of a bitcoin on Bitcoin.)
- `gigabutton` - 10^9 buttons.
- `terabutton` - 10^12 buttons.
- `satoshi` - 10^14 buttons = 10^6 ninjabuttons. (One million ninjabuttons.)

Ticker symbol: NJA (one ninjabutton).

Total quantity: Slightly more than 42 million ninjatokens, following the same
distribution scheme as Bitcoin, fairly mined on day one, with an initial block
reward of 100 ninjatokens.

## Changes to Bitcoin

SatoRed is based on the original Bitcoin, which inluded an unlimited block size.
However, we are making some changes that make sense in light of all of the
information in from 2009 until now.

- [ ] Proof-of-work function that runs on GPUs and is ASIC-resistant.
- [ ] Layer 1 token protocol (solving "back to genesis" problem).
- [ ] No maximum block size (block size is a policy).
- [ ] No maximum transaction size (transaction size is a policy).
- [ ] No maximum script size (script size is a policy).
- [ ] No maximum signature verification operations (signature verification
  operations is a policy).
- [ ] SPV on day 1. No "pay to address".

Some changes created by Bitcoin Core and other are also not included.

- [ ] No P2SH.
- [ ] No SegWit.

## Governance

At this time, SatoRed is a company owned 100% by Ryan X. Charles, who has the
final say about all technology, all branding, all marketing, all product, and
all other decisions. Anyone who disagrees is free to fork the code and create
their own version.

Investors and employees will join the company and decision making will work like
any company with a CEO and a board of directors.