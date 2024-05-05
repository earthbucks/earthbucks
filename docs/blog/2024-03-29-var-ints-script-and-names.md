# Var Ints, Script, and Names

March 29, 2024

I am building the data structures one-by-one simultaneously in both Rust and
TypeScript (thanks to AI, this is not as hard as it may sound). I plan to
eliminate the use of little endian and reverse hashes. Instead, we will be using
big endian and hashes will be in the expected order. The var int implementation
has already been completed using big endian instead of little endian. And
addresses use double blake3 hashing in the expected order.

I am working my way towards an implementation of script, transactions, and blocks.

Meanwhile, I have been thinking about the token name a lot. Because the project
is already called "EarthBucks", a simple naming scheme is as follows:

- `satoshi` - The smallest value. (The analog of a satoshi on Bitcoin.)
- `earthbucks` - 10^8 satoshis. (The analog of a bitcoin on Bitcoin.)

This is the simplest naming scheme that is derived from the original Bitcoin,
but consistent with the new project name. The ticker symbol will be SRED (one
earthbucks). It is still possible the name of the project will change before launch
if I can secure a more premium domain name.

Ryan X. Charles