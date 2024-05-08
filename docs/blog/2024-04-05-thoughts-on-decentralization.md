+++
title = "Thoughts on Decentralization"
author = "Ryan X. Charles"
date = "2024-04-05"
+++

The goal of EarthBucks is to enable small casual transactions with minimal
trust, just like cash, but over the internet. Fees should be low or zero and
there should be low or no risk of chargeback fraud. Having some degree of
decentralization is helpful to achieve this goal, but decentralization is not
itself the goal.

The way the word "decentralization" is used is usually ambiguous, and can have
conflicting meanings. For EarthBucks, the relevant parameter is how many
entities run mining pools, which verify all transactions. The answer is there
should be at least three mining pools, but it is not expected that ordinary
users will run a pool. Users can use SPV wallet to send/receive/verify their own
transactions and they can hash on a mining pool without verifying all
transactions. SPV nodes serve as a guard against fraud by the miners. Mining
pools plus SPV nodes creates exactly the amount of decentralization necessary to
achieve the goal of small casual transactions.

Decentralization is not the goal. The goal is small casual transactions. The
system should be exactly as decentralized as necessary to achieve this goal.
This implies some degree of centralization. Maximizing decentralization, in the
sense that everybody verifies all transactions, is impractical and unnecessary.
Small casual transactions only require a few mining pools and a large number of
SPV nodes.
