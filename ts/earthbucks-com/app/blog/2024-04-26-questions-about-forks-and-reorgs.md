+++
title = "Questions about Forks and Reorgs"
author = "Ryan X. Charles"
date = "2024-04-26"
+++

Q: Can EarthBucks have a reorg?

A. There are no reorgs by design. Miners (also called "mines") vote on every
block. Once a majority of mining power approves a block, the network
acknowledges that and begins to build on it. There is no code to support a
reorg. If a mine creates a block that only a minority of mining power approves,
then the network will fork.

Q: Aren't forks bad?

Forks will only happen if the software is buggy, which we do everything to
prevent, or if a mine intentionally creates a fork. In the case of bugs, a mine
can have an extra check that if they ever fall out of the majority, they simply
halt, because something must be wrong. That prevents altchains from being
created unintentionally.

But altchains can also be created intentionally. This can be supported in wallet
software automatically. New blocks are a new chain, and the wallet can
automatically watch all chains. There will be a sighash algorithm that includes
the recent block ID in the transaction hash, providing automatic replay
protection for all forks.

Forks are OK if they are intentional. That just means a mine wants to create a
new chain.

Q: How fast are transactions in EarthBucks?

A: Every transaction is broadcast to all mines. All mines not only validate, but
also vote on all transactions. Once a transaction has been voted, it is valid
and included in the next block. If a minority disagree, they will create a fork.
Again, forks will only happen if they are intentional, or there is a bug, which
we do everything to prevent.

It is very important that transactions can be voted so quickly. The voting
should happen in about 300ms, enough for two round trip messages round the
world. One for broadcasting the transaction and another for voting on it.
(Perhaps this could be optimized by doing a single round trip message). This
gives users very rapid acknowlegement that their transaction is valid, not just
with one miner, but across the entire network.

Q: What happens if most miners create block A, but one miner creates an
alternate block A'?

Assuming there are no bugs in the software, this will not happen
unintentionally. When a new block arrives, mines drop everything to validate it
and vote on it. This should happen in less than 300ms. They will not mine an
alternate block in the meantime, guaranteeing no alternate chain is created.

However, alt blocks can be created intentionally. There are no reorgs. Alt
blocks are simply new chains. Wallet software can automatically watch all
chains. The sighash algorithm includes the recent block ID in the transaction
hash, providing automatic replay protection for all forks. Users will get a new
asset in their wallet.

A lot of software has to be written to support all of this, and that may not be
present in the software on launch day, but the intention of EarthBucks is to be
altchain-friendly. Any mine who disagrees with changes to the rules should be
able to create an altchain. This is a feature, not a bug. The protocol includes
a sighash algorithm with the most recent block ID to provide automatic replay
protection for all forks. This makes forks safe.
