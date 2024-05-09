+++
title = "EarthBucks Big Decisions Summary: GPUs, 42 Million, and More"
author = "Ryan X. Charles"
date = "2024-05-09"
+++

EarthBucks is a big block blockchain with GPU mining, Script, and 42 million
coins. It is currently being developed with estimated release date of July,
2024. I have written a series of blog posts describing the decisions I have made
building EarthBucks up to this point. I have put all articles about EarthBucks
up at the blog located at [earthbucks.com/blog](https://earthbucks.com/blog/).
Please point all interested parties to the website at
[earthbucks.com](https:/earthbucks.com) as the authoritative source of
information about EarthBucks.

In this article, I aim to summarize all key decisions about EarthBucks in the
past month and a half and link to all relevant articles.

## GPU Mining

- EarthBucks is desiged to be mined on consumer GPUs (["One-GPU-one-vote"](./2024-03-26-one-gpu-one-vote.md)). Ordinary people should be able to visit the website to easily mine EarthBucks.
- I have created a new class of algorithms based on matrix multiplication to be used for the GPU proof-of-work (PoW) algorithm. The current PoW algorithm is called algo1627 and is, basically, a giant 1627x1627 matrix multiplication. with pseudorandom data taken from recent blocks.
