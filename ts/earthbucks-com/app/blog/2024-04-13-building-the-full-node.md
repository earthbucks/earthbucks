+++
title = "Building the Full Node"
author = "Ryan X. Charles"
date = "2024-04-13"
+++

I have started building the full node, which is actually a mining pool that
builds blocks and must run at a particular domain name. Unlike Bitcoin, I am not
using a custom p2p protocol on port 8333. Instead, I am assuming all nodes are
either businesses or run by sophisticated hobbyists who understand how to
operate a web service. This means we get all the features of the web by default,
including secure and authenticated connections.

I am writing the full node software in Rust. Each domain will have a master
private key which is used to create Coinbase transactions and distribute funds
to the miners (the users of the domain who perform hashing and other
proof-of-work functions).

I have decided to use MySQL as the database because it is fast, fully-featured,
widely supported, and scalable to unlimited size through the use of sharding
technologies such as Vitess.

The full node has two pieces. The first piece is the builder which monitors the
database for new transactions and new blocks. It validates all transactions and
all blocks and builds new blocks, minus proof-of-work. It is assumed the users
will perform the proof-of-work and submit the block headers to the builder,
otherwise the builder is unlikely to ever find a block.

The second piece of the full node is the API, which listens to incoming requests
and can either return data, such as a getting a transaction, or writing data,
such as submitting a new block header. The API scales horizontally, so that it
can be deployed in rolling fashion and never go down, and the builder scales
vertically, so it can handle large blocks. Making the full node highly available
and scalable is what requires it to be broken into two pieces.

Aside from MySQL, I am also using sqlx to manage the MySQL database, and tokio
to manage the async I/O, and actix-web to manage the API. These are all popular
and highly supported Rust libraries.

The full node, which includes the mining pool system, is necessary for launch. I
also plan to build a light node, which monitors only the users' transactions but
does not validate full blocks. The light node may or may not be finished by
launch.
