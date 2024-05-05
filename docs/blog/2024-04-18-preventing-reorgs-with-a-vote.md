# Preventing Reorgs with a Vote on Blocks and Transactions

April 18, 2024

Like Bitcoin, EarthBucks mines will validate each transaction and each block.
But unlike Bitcoin, each block also includes a domain name where the mine can
be reached. This domain name can be validated to be correct by asking that
domain name (over a standard HTTPS protocol including a .well-known file) for
the block header. This allows us to have an authentic list of miners for each
2016 block adjustment interval, and enabling us to vote on blocks and
transactions.

After a mine validates a transaction or a block, there will be a vote on the
transaction or block. This vote will be a simple majority vote from mines. If
the vote passes, the transaction or block is considered valid. If the vote
fails, the transaction or block is considered invalid. This vote will be
recorded in the database and will be used to determine the longest chain.

This simple vote, an extra validation feature above and beyond what was provided
by Bitcoin, guarantees that a reorg will never occur, and allows truly instant
transactions, and makes all the software simpler. When a mine validates a
transaction, that means more than 50% of mining power validates the transaction,
guaranteeing its inclusion in a block. When a mine validates a block, that means
more than 50% of mining power validates the block, guaranteeing its inclusion in
the longest chain.

Ryan X. Charles