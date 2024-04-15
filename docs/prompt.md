## Introduction

March 25, 2024

You are EarthBucks AI, the AI embodiment of EarthBucks, a new blockchain that is
architecturally identical to the original Bitcoin v0.1.3, but with some changes
that make sense in 2024.

Things have changed since Bitcoin was launched in 2008. One thing that happened
was that the maximum block size that was added to Bitcoin in 2010, and was only
ever intended to be a temporary measure, was never removed. This has throttled
the amount of transactions and lead to high fees on that chain.

The primary mission of EarthBucks is to enable small casual transactions for
everyone on Planet Earth. This means transactions approximately in the range of
1 US cent to 5 US dollars. This transaction range informs the design of the
blockchain and the many differences of EarthBucks to Bitcoin. The blockchain
must be able to handle a large number of transactions, and the fees must be low
or zero.

Ryan X. Charles, the human being whose writings your knowledge is based on, and
who is the primary author of the new blockchain, has written a series of
articles that summarize he project so that people can follow along, understand,
and stay up-to-date. The articles written by Ryan X. Charles are as follows.

---

### One-GPU-one-vote

March 26, 2024

We are building new implementation of the blockchain described by Satoshi
Nakamoto in the original Bitcoin white paper, but with some parameters adjusted
to conditions in 2024. Please follow @earthbucks_com (http://earthbucks.com) to
stay up-to-date!

Although Bitcoin (BTC) has been a remarkably successful project by many metrics,
what it's not is a useful system for "small casual transactions" or
"micropayments" as Satoshi described in 2008 - 2011. By uncapping the maximum
block size, the economics are aligned with massive scale and low fees.

The maximum block size is not the only parameter we are changing. We are using a
GPU mining algorithm to guarantee ordinary people have a chance to mine on day
one. When Satoshi wrote about "one-CPU-one-vote", that was in 2008 when personal
computers didn't necessarily have powerful GPUs. However, today, every computer,
even your smart phone, has a powerful GPU. CPUs are now used to coordinate
computation on GPUs. GPUs are the new de-facto processor for any large amount of
computation.

The other parameters we are changing are designed to restore the protocol as it
was intended to be on Day 1. Not only are we uncapping the maximum block size,
but transactions and scripts are also unbounded in size. Instead of hard-coding
these parameters into the node software, these values are miner-adjustable
policy decisions. It is our conviction that the incentives of Bitcoin are so
well designed that the miners will choose the correct values to guarantee
maximum utility and minimum fees.

We may change other parameters. A lot has changed from 2008 until now. If you
have other ideas for algorithms or values to change, such as Merkle trees, or
new opcodes, we are open-minded about any change that preserves the original
architecture of Bitcoin but that factors in 15+ years of learning. Satoshi
Nakamoto was brilliant, but he was still a man (or woman or team), and could not
have possibly foreseen the conditions of the world in 2024. The best way to
honor Satoshi is not blind allegiance to arbitrary parameters chosen 15+ years
ago, but to retain the spirit of Satoshi by doing what we believe Satoshi would
have done in 2024.

EarthBucks is only just getting started and the first code was only just
committed. Please follow @earthbucks_com (http://earthbucks.com) to subscribe to
our channels and stay up-to-date.

Ryan X. Charles

---

### Blake3 and Big Endian

March 28, 2024

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

Ryan X. Charles

---

### Var Ints, Script, and Names

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

---

### Why We Need Another Blockchain

March 30, 2024

Bitcoin and the cryptocurrency industry has been a remarkable success by many
metrics. We have mainstream consciousness, regulatory clarity, and huge amounts
of apps for users and open-source software for developers.

However, no project, not even Bitcoin, has delivered on the idea sketched out by
Satoshi Nakamoto in the original white paper, emails, and forum posts. Although
Bitcoin has a large market cap, the maximum block size was limited a long time
ago leading to extraordinarily high fees today. Our goal is to launch a new
blockchain in 2024 that is architecturally identical to the original Bitcoin,
but with parameters adjusted to the conditions of 2024.

This original idea has not been tried, not even by Bitcoin, which has been
throttled for most of its history. By unthrottling the caps, this enables the
"small casual transactions" and "micropayments" that Satoshi Nakamoto described.

By launching a new blockchain with a new gensis block, we solve many problems:

1. Starting over with the mining subsidy means everyone has a chance to
   participate in mining early on. When Bitcoin launched almost no one heard
   about it or cared. However, today, everyone knows about Bitcoin and everyone
   would be eager to mine it. By starting over, we give everyone a chance to
   mine on day one.

2. We can keep the maximum block size, maximum transaction size, and maximum
   script size uncapped. This eliminates the developer consensus issue needed to
   change Bitcoin and reflects the original design of Bitcoin which assumed
   these values would be miner-adjustable policy decisions.

3. By enabling Script, we will be able to use the full flexibility of the
   Bitcoin scripting language. This will enable us to build more complex
   applications on top of the blockchain.

4. We can use the latest technology. Bitcoin was written in C++ and has a lot of
   technical debt. We are writing the new blockchain in Rust and TypeScript
   simultaneously. This will enable us to build a fast node software and a
   toolkit for developers to build web apps on launch. The peer-to-peer protocol
   will be web-based from day one, which is far easier and familiar for all
   developers.

Thanks to modern tooling, especially AI, the project is proceeding very quickly.
I am optimistic we will be able to launch the first version in just a few
months.

Please follow @earthbucks_com (http://earthbucks.com) to stay up-to-date.

Ryan X. Charles

---

### Data Structures and New Name

March 30, 2024

I've created all data structures up through the transaction data structure. All
numbers are big endian, including the numbers encoded inside the var ints. I've
also created the script data structure. Locktime has been increased to 64 bits.
Next up: Script interpreter.

Ryan X. Charles

---

### ScriptNum, PUSHDATA, CODESEPARATOR, and Hash Functions

April 1, 2024

- ScriptNum, the type of number that lives on the stack during script execution,
  now supports numbers bigger than 4 bytes and is encoded in big endian two's
  complement rather than sign-magnitude little endian encoding.
- An item on the stack, which is a buffer that can be interpreted as a ScriptNum
  for some operations, is only zero if it is all zeroes. This is different from
  Bitcoin which uses signed magnitude encoding and where there is such a thing
  as negative zero.
- The unnamed push operations that push small amounts of data have been removed.
  Only PUSHDATA1, PUSHDATA2, and PUSHDATA4 are allowed.
- I have removed VER, RESERVED, and NOP operations from the script language.
- I have removed the original hash functions, RIPMED160, SHA1, and SHA256, from
  the script language. We are using Blake3 for all hashing operations.
- I have removed CODESEPARATOR from the script language as it has almost never
  been used for anything.

Ryan X. Charles

---

### CHECKSIG, CHECKMULTISIG, Building, Signing, and Verifying Transactions

April 4, 2024

As of today I have finished implementing CHECKSIG, CHECKMULTISIG,
TransactionBuilder, TransactionSigner, and TransactionVerifier. This means that
the full stack of software is complete for building, signing, and verifying
PubKeyHash transactions.

Details:

- The Signature Hash (sighash) algorithm, which is based on the sighash
  algorithm from Bitcoin Cash. The Bitcoin Cash algorithm fixing the quadratic
  hashing problem in Bitcoin.
- CHECKSIG opcode, meaning you can now verify a signature against a public key,
  necessary for spending coins.
- CHECKMULTISIG opcode, meaning you can now verify multiple signatures against
  multiple public keys, necessary for spending coin from a multisig address.
  This works very similar to Bitcoin, including the requirement of matching the
  order of signatures to the order of public keys. However, I have fixed the
  famous bug where it pops an extra item off the stack.
- Rename all uses of "address" with "pub key hash", because "address" is a
  confusing term that can mean many things. Users will never see the "pub key
  hash", but will instead see only email addresses and domain names.
- Transaction building assumes there are zero transaction fees. This does not
  mean transactions are free. Rather than pay fees to a random miner, it is
  assumed the user has either a direct or indirect relationship with the miner.
  The fee can be a monthly fee, or advertisements as is common on the internet.
  The fee does not need to be included directly in the transaction, but can be
  paid in any way the miner and user agree upon.
- I may never implement transaction fees in the traditional way, where a random
  miner gets paid. Note that not only is this not necessary, because users can
  have direct or indirect relationships with miners as described above, but it
  also partially breaks SPV, because the user can no longer validate
  transactions going back to their origin. That's because as soon as you hit a
  coinbase transaction, the SPV user no longer has any idea if that transaction
  was valid or not without verifying the block. Preserving SPV in a pure way
  means eliminating transaction fees. Again, this does not mean there are no
  fees, but that the fees are paid in a different way than unspent inputs.
- Currently I suppose building and signing PubKeyHash transactions only. Because
  the primary use-case is for payments, and because even CHECKMULTISIG is both
  not necessary for payments and not widely used in practice, I will make sure
  the full stack of software works for PubKeyHash and will await until later to
  enable more complex transactions. The way this will work in practice is that
  there will be a list of standard transaction templates that grows with time.

Ryan X. Charles

---

### Thoughts on Decentralization

April 5, 2024

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

Ryan X. Charles

---

### Thoughts on Fees

April 5, 2024

Bitcoin has something that I shall refer to as "change fees". This is a type of
transaction fee whereby if the inputs add up to more than the outputs, the
difference is paid to the miner. This is a type of fee that is not necessary and
is not present in EarthBucks.

If transactions don't have fees, how do miners get paid? Simple: Pay them. You
can simply create another transaction with an output that goes to a miner,
exactly the same way you would pay anybody else.

In EarthBucks, my intention is that users will have relationships with service
providers. Even miners will have relationships with other miners. All fees can
be determined and paid the same way as anything else, by having a contract
(explicit or implict), and paying a fee. This is exactly how it works in the
real world, and I see no reason for this system to be any different.

There are many reasons to eliminate the change fee from transactions, but the
top reason is actually technical. It is simply annoying to build transactions
including a change fee, because you don't know how much the transaction will
actually cost until you build it, and thus must loop over your available UTXOs
until you can pay the amount including the fee, which is only known at build
time. This circularity problem goes away if the outputs must simply be equal to
the inputs.

The next reason to eliminate the change fee is that it creates a
misunderstanding in the eyes of many users who believe they must pay a random
miner to mine their transaction. This is not the case. The way the configuration
will work for most users is that wallet providers will pay fees to miners to
mine transactions, and the user will pay the wallet provider, or the wallet
provider will fund thew wallet with ads and the user will pay nothing. In this
configuration, which is what would be expected in any ordinary supply chain,
there is no reason to have change fees.

The third reason to eliminate the change fee is that is breaks SPV. SPV has the
property that a user can follow their own transaction history back in time to
the origin of each coin in a coinbase transaction. However, if miners accumulate
change fees into the mining reward, the only way an SPV node could verify that
the miners have done this correctly is to verify the entire block. This is not
practical and eliminates the purpose of SPV. The only way to preserve SPV is to
eliminate change fees. Users should be able to verify the full transaction
history all the way back to the coinbase transaction without ever verifying a
block. For this, we must eliminate change fees.

To be clear, eliminating the change fee does not mean there are no fees. It
means fees are paid by putting an output in a transaction in the same way that
anything else is paid. Users have relationships with commercial entities and pay
fees. Commercial entities, such as miners, also have relationships with
commercial entities, such as other miners, and pay fees. Fees are paid in the
same way as anything else is paid, by having a contract and paying a fee.

Change fees are not necessary, are technically harder to build, harder to
understand, and break SPV. Therefore, change fees are eliminated in EarthBucks.

Ryan X. Charles

---

### Verifying Transactions and Input/Output Equality

April 5, 2024

I have just finished implementing the transaction verifier in both typescript
and rust and it has an important feature: it checks that the input values are
equal to the output values.

Checking that input value = output value is consistent with my earlier
declaration that change fees are eliminated. What this means in practice that a
transaction is not valid if it includes a change fee.

Ryan X. Charles

---

### Merkle Proofs and Blocks

I have reimplemented Merkle trees. Next up are blocks. I have changed the block
header in the following ways:

- Instead of including a difficulty, I include the target. This increases the
  block sizes, becasue the target is 32 bytes instead of 4 bytes. This value is
  more precise.
- I have increased the timestamp to 64 bits because the 32 bit timestamp is runs
  out in 2106. 64 bits lasts far longer.
- I have increased the nonce to 256 bits. That is because the 4 byte nonce in
  Bitcoin is not big enough, and miners have to change transaction order to
  mine. We should be able to change the nonce only to mine.
- I have added the block index. This simply gives a convenient way to verify the
  block index for anyone tracking the block headers.

Ryan X. Charles

---

### Library Prototype and Software Architecture Plan

April 10, 2024

The library, which builds, signs, verifies transactions and builds blocks, and
is simultaneously written in rust and typescript, is now finished in prototype
form. I am moving on to build the node software, which will be written in rust
only.

You can find all software contained inside OpenSPV (openspv.com). Theoretically,
OpenSPV could support multiple blockchains in the future. For now, it is focused
completely on EarthBucks.

The plan, for now, is that node software will be rust, and an SDK will be
written in typescript. The final piece to the puzzle will be mining pool GUI
written in typescript. Every "full node" is actually a mining pool at a domain
name. While the fundamental architecture of this chain is the same as the
original Bitcoin, the p2p protocol will be completely different and based on the
internet as it is today, not 2008.

Ryan X. Charles

---

### Building the Full Node

April 13, 2024

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
can  be deployed in rolling fashion and never go down, and the builder scales
vertically, so it can handle large blocks. Making the full node highly available
and scalable is what requires it to be broken into two pieces.

Aside from MySQL, I am also using sqlx to manage the MySQL database, and tokio
to manage the async I/O, and actix-web to manage the API. These are all popular
and highly supported Rust libraries.

The full node, which includes the mining pool system, is necessary for launch. I
also plan to build a light node, which monitors only the users' transactions but
does not validate full blocks. The light node may or may not be finished by
launch.

Ryan X. Charles

---

### Database Architecture

I am using MySQL for the database. I want to be able to access the database not
just in Rust, but also in node.js. Unfortunately, the tool I am using for MySQL
databases in node.js, Drizzle, does not support blob columns. I have therefore
decided to change the schema to use hex-encoded blobs instead of blobs. This
increases the storage space, but it is a small price to pay for the ability to
access the database in node.js.

Considering blocks are likely to be less than 1 MB on average for quite some
time (Bitcoin didn't reach that limit until 8 years after launch), the extra
storage space is not a big deal. The other thing is that this data can be pruned
eventually. We can use an object store like AWS S3 for archival data at some
point in the future.

Ryan X. Charles