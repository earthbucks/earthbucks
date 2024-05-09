+++
title = "Rust Result in TypeScript"
author = "Ryan X. Charles"
date = "2024-05-09"
+++

The EarthBucks library is co-written in both Rust and TypeScript. It includes an
implementation of all basic data structures including transactions and blocks
with standard test vectors. Implementing everything in both languages has been
very informative. It is clear the Rust Result enum for handling errors is
superior to exceptions in TypeScript. As such, I have decided to change all
error handling in TypeScript to use the
[ts-results](https://www.npmjs.com/package/ts-results) library in node.js which
is a TypeScript implementation of Rust's Result enum.

I had issues getting ts-results to build in vite for the webapp, so the code for
ts-results has been ported directly into the TypeScript library. I plan to use
this pattern not just for the internals of the library, but also the external
interface, and to even mimic this pattern for the RPC interface to be used by
the peer-to-peer network and third-party apps.
