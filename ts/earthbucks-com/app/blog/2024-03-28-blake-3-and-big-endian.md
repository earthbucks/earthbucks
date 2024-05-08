+++
title = "Blake3 and Big Endian"
author = "Ryan X. Charles"
date = "2024-03-28"
+++

I am proceeding to build the core data structers, starting with the Buffer
Reader and Buffer Writer and core hash function.

The primary hash function is Blake3. Some argue this is better than SHA256, but
"better" is not the reason I am using it. Currently, there are no ASICs that
support Blake3. I am using this hash function for addresses, transactions, and
blocks. It is possible I will add additional hash functions to the proof-of-work
(PoW) algorithm, but Blake3 may be sufficient on its own.

I am also changing the use of little endian. Most people find big endian to be
the more intuitive way to encode numbers, and there is no reason to not use big
endian everywhere inside the data structures, particularly the ones sent over
the network.

More changes are coming. The code is being written in Rust and TypeScript
simultaneously to guarantee a fast node software and a toolkit for developers to
build web apps.
