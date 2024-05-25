+++
title = "Mines vs. Miners"
author = "Ryan X. Charles"
date = "2024-05-22"
+++

A **miner** is a person who does proof-of-work (PoW) computations on their
computer.

A **mine** is a web service, available 24/7 and hosted at a domain, that validates
all transactions and creates and validates blocks. A mine has a user system and
allows users to perform PoW calculations and submit PoW to get a portion of
EarthBucks in the coinbase transaction of each new block produced by the mine.

Anybody can be a miner. Mining on EarthBucks uses a [PoW
algorithm](./2024-04-25-a-pow-algo-for-gpus.md) designed run on consumer
devices. The algorithm is designed to be updated regularly so that it remains
optimized for consumer devices, which discourages the development of custom
hardware (i.e., application-specific integrated circuits, or ASICs). This
ensures that ordinary people will always be able to get some EarthBucks by using
their personal device such as a smart phone or laptop computer.

Ordinary people will not be operating mines. A mine on EarthBucks is similar to a
mining pool on other blockchains such as Bitcoin. A mine has users who perform
the actual PoW calculations. The mine takes a portion of the mining reward for
the service of operating the mining pool and all other network rules pertaining
to connecting to other mines and validating transactions and blocks. The mine
will also take revenue for writing transaction data to the blockchain.

It is expected that most ordinary users will use a wallet, which will provide
standard payment mechanisms completely for free, so that the user does not have
to pay anything under ordinary circumstances. However, if the user conducts a
large volume of transactions, like a merchant, they will pay a fee to the wallet
provider, who will in turn pay a fee to a mine.

At launch, I will be operating the first mine, and I will have a Terms of
Service (ToS) that limits usage to one device per user. Professional miners with
many GPUs will be able to use one of them for mining on EarthBucks, but they
will be prohibited from using all their GPUs. This is to make sure that
individual people are able to get a significant amount of EarthBucks without
having to worry that one user with a huge number of GPUs will dominate the
network.

PoW is used as a consensus mechanism in EarthBucks, similar to Bitcoin. But
unlike Bitcoin, PoW is not used as a security mechanism in any respect on
EarthBucks. The security is provided through the use of digital signatures, hash
functions, and other computational checks such as the check that prevents double
spends. Security is also provided through the use of the initial ToS and other
contracts that will be created after the project launches, meaning individual
human oversight will play a role in preventing abuse. PoW is a way for each
mine, and their associated miners, to arrive at a consensus about the order of
transactions and about which mine gets the next block in the blockchain. PoW
does not play a role in securing the network in any way.

A simplistic view of the network structure of EarthBucks looks like this:

- **Mines**: These are the core of the network. There will be somewhere from 3
  to 2016 mines. All mines connect to all other mines and validate all
  tranactions and all blocks on the network. Mines have users who are called
  miners.
- **Miners**: Someone who performs PoW calculations on their computer and
  connects to a mine.
- **Wallets**: These are typically businesses who have users who hold
  self-custodial EarthBucks. A wallet is a tool a user uses to connect to the
  network and send and receive EarthBucks. A user may use both a wallet and a
  mine.
- **Custodian**. A wallet who holds the user's keys, i.e., a custodial wallet.
- **Archival nodes**. Mines do not have to archive all data because [all UTXOs
  expire after 90 days](./2024-05-18-why-all-utxos-expire.md). However, some nodes
  will archive all data. These nodes are called archival nodes. Archival nodes
  are not necessary for the network to function, but there will likely be
  multiple archival nodes, as they are easy to run, and are not expensive to run
  until the network is very large. Archival nodes are what a block explorer will
  run.
- **Validator nodes**. These are like a mine except they do not produce new
  blocks, they only validate new or old blocks. They will most likely pay a mine
  or an archival node for data. These are what enthusiasts who want to learn
  about the network will run.
- **Apps**. Any app that uses EarthBucks, like
  [Artintellica](https://artintellica.com), may either host its own wallet or
  outsource that functionality to another wallet provider.

Mines form a small world graph. Miners connect to mines. Wallets connect to
mines. Users (who may also be miners) connect to wallets. Archival nodes connect
to mines. Validator nodes connect to mines. Apps either connect to a wallet or
to mines.

Wallets connect with other wallets when a transaction is being sent from one
user to another.
