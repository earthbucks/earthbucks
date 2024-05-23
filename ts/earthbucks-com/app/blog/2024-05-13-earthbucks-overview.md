+++
title = "EarthBucks Overview: 42 million EBX, no pre-mine, GPUs, big blocks, and script"
author = "Ryan X. Charles"
date = "2024-05-13"
+++

EarthBucks is a new blockchain designed for small casual transactions, meaning
digital cash transactions in the range of 1 US cent to 5 US dollars. Most of the
fundamental software has been written (in both Rust and TypeScript), and I have
entered a phase of extensive testing where I am writing standardized test
vectors for all possible errors pertaining to transaction verification. This
phase is a bit boring, so it seems like a good time to give an overview of the
entire project.

## 42 million EBX

EarthBucks is a new blockchain with a new genesis block in 2024. My goal is to
launch the network in July and to have up to 100 people participate in mining
the genesis block. Between all social accounts, there are ~500 people following
the project, so it should be possible to get at least 100 mining on Day 1.

The distribution schedule for EarthBucks is exactly the same as Bitcoin, with a
four year halving schedule, except instead of starting with 50 coins per block,
I am starting with 100 coins per block, meaning the total amount will never be
more than 42 million.

The distribution is technically a geometric series. Mathematically, it reaches
42 million as time approaches infinity. Of course, that will never actually
happen. Furthermore, the base unit ("satoshis") is finite, just like Bitcoin,
meaning after enough halvings, eventually the resolution drops below the
smallest unit, and there will be no more coins. **It is my intention that a new
transaction type should be created, decades from now, to ensure the continued
release of coins forever, while still never going beyond 42 million**. The new
transaction type can simply shift the value so that the halving does not drop
below the resolution of the unit. New transaction types should be created ad
infinitum so that the number of new coins never reaches an end. However, it is
still forever limited to 42 million total.

## No pre-mine

The United States Government (USG) has finally started cracking down on illegal
securities in the cryptocurrency industry. Not only would it be a bad idea to
create an illegal security today, but I personally find those projects
distasteful. I am not a lawyer, so take my opinion on securities with a grain of
salt, but in the US, the defining conditions for a security are given by the
Howey test, which says:

1. There is an investment of money
2. There is an expectation of profits from the investment
3. The investment of money is in a common enterprise
4. Any profit comes from the efforts of a promoter or third party

By avoiding all four conditions, I am not making a security. Therefore,

1. There is no way to invest money in the coin
2. There is no promise of a rising value of the coin
3. There is no common enterprise selling the coin
4. I am not promoting the value of the coin or promising to do so

This means there is no pre-mine, and I am not and will never raise money by
selling the coin. Instead, I will simply be making a business that uses the
coin, similar to the way PayPal uses the US dollar. My business will raise
money, but it will do so by issuing equity completely disconnected from the
coin.

The only way to get the coin is by mining (or buying it from someone who has
it).

## GPUs

I have decided against using the SHA256 hash function for mining, because
commodity hardware cannot mine SHA256 profitably. The only way to mine SHA256 is
by purchasing an ASIC. In order to make mining accessible to ordinary people
with commodity hardware launch day, I have both changed the hash function from
SHA256 to Blake3, for which there is no ASIC, and also designed a proof-of-work
(PoW) algorithm, which I call "algo1627", which is specifically designed for
GPUs.

The way the algorithm works is as follows. Pseudorandom data is collected from
the current working block header and recent block headers. This pseudorandom
data is used to construct a large matrix of size 1627x1627 on the GPU. This
matrix is multiplied by itself with (deterministic) integer operations. Then a
series of (deterministic) floating point operations are performed on each
element. Then the matrix is reduced, sent back to the CPU, and then hashed. That
hash is included in the block header to get the final ID of the header, which
must be below the target, exactly like Bitcoin.

The details of the algorithm may change after launch, but the basic idea is to
use all the features of the GPU (massively parallel integer and floating point
operations, such as in a large matrix multiplication), while minimizing the use
of bandwidth to and from the GPU, and also guaranteeing that is deterministic.

The algorithm is also designed to be adjustable so that I can change it with
time. I can easily increase the dimension of the matrix multiplication, for
example, to discourage anyone from building an ASIC. Any ASIC will become
obsolete by simply adjusting the algorithm to make deeper and better use of
GPUs. The ASIC for EarthBucks **is** the GPU on your personal computer.

By leveraging the high power GPU now common to most personal computers, my
intention is to overlap with the AI revolution, and give people a way to earn
money by pivoting between mining and AI. I want to make sure ordinary people
always have a way to get going with EarthBucks by mining a little bit on their
personal computer.

I am also making another important change. The consensus algorithm is not just
determined by PoW, but also has a vote. After each transaction and block is
received, the mine will ping all other mines. The mines are known because they
must publish a domain name in the block header. The transactions are thus
technically validated _and_ voted on. In order to be valid, a transaction and
block must pass all technical tests, and must also be agreed to by a majority of
PoW power. This enables nearly instant transaction and block confirmations and
makes blockchain reorgs impossible. This improves the user experience, developer
experience, and business experience of EarthBucks and has no known drawbacks.
The only reason why Bitcoin doesn't do this is probably that it was intended to
be anonymous. By de-anonymizing mines (including a domain name in each block), a
radically improved user experience is possible.

## Big Blocks

Satoshi Nakamoto added a maximum block size to Bitcoin in 2010, which has
forever altered the course of the Bitcoin ecosystem. Fees on Bitcoin recently
rose to hundreds of dollars per transaction, eliminating all use-cases except
big money speculation. Bitcoin is completely useless to ordinary people.

EarthBucks is designed to be exactly the opposite. There will never be a block
size limit. Instead, mines must grow with the transaction volume. This does not
mean there are no limits. There will be limits per user on the number of
transactions, beyond which the user will have to pay, which gives the network a
way to pay for the software and hardware growth necessary to support the
network.

I am making other changes to the blockchain to make it friendly to small casual
transactions. **Every UTXO will expire after no longer than one year**, which
encourages all users to either be active or to give their coins away to new
users. Expiring UTXOs has many desirable properties, one of which is making it
possible to change and upgrade the transaction types without having to maintain
the software to spend old UTXOs forever. It also has better security properties
as all users must rotate their keys, similar to best security practice for
organizations and individuals.

## Script

The scripting language in Bitcoin is almost entirely useless due to limits on
the script size, transaction size, and standard transaction types. I have
re-enabled script, but with a big caveat. Script is hard to test, and it is also
necessary to require certain script properties in order to guarantee all UTXOs
expire after a year. Therefore, I am including the notion of standard script
templates in EarthBucks with the intention of growing the list of standard
templates with time. Similar to any distributed protocol, my plan is to work
with the community to determine the best script templates to add on a regular
basis. That gives us a way to extensively test each template before launching
it.

## Network Structure

Beyond these technical details, I am also changing the way the network works
compared to Bitcoin in a fundamental way. In fact, saying it is a change is an
understatement, because this blockchain is written from-scratch and has no
software in common with Bitcoin whatsoever, except for some basic principles,
such as the architecture of transactions and blocks. One of the biggest
"changes" is how the P2P network works.

Mines, also called "mining pools" on Bitcoin, have some fundamental differences
to Bitcoin. In Bitcoin, mines are anonymous. In EarthBucks, mines must have a
domain name with customers and must satisfy a Terms of Service agreement (TOS)
with my first mine in order to connect to the network. The TOS has yet to be
written, but will specify terms such as basic computational requirements and
other limitations designed to encourage the network to be global, decentralized,
and work for the intended use-case of small casual transactions.

Like Bitcoin, there can never be more than about 2016 mines. That is because the
difficulty adjustment window is two weeks, and for ten minute blocks, that is
2016 blocks every window. The difficulty is likely to adjust every window, and
therefore, if a mine is unable to produce a block in a two week window, it is
unlikely they will ever produce a block, meaning a practical upper limit of 2016
mines. In practice, there will be far fewer mines.

My goal is to use the TOS to design all early mines to make sure some conditions
are met:

- I will personally run six mines distributed all over the world. I will
  guarantee my network is able to maintain at least 30% of the hash power.
- I will personally select some early permissioned mines who are distributed
  globally. These early mines will get some guaranteed fraction of the network
  in order to ensure the network achieves its aims.
- I will also allow up to about 30% of the network to be "permissionless",
  meaning I will not govern who operates the mines or where they are located,
  enabling a large fraction of purely market-driven mines to exist.

My goal is absolutely not to allow the network to be taken over by anonymous
mines. Even the permissionless mines are likely to be ordinary businesses with
known verifiable physical addresses. Not only is this important to make sure the
network is achieving its aims, but it is also important to prevent criminals
from the cryptocurrency industry from trying to use this network for money
laundering or other illegal and illicit purposes.

EarthBucks can be thought of as a privately regulated blockchain, where I am
personally regulating the network on the first day, and plan to carefully
distribute my control to ensure the growth of the network for the use-case of
small casual transactions and to prevent abuse.

## History and Launch

The first commit to EarthBucks was on March 24, 2024. It was originally called
"Satoshi's Redemption", and later "IMPStack", but the name was changed to
EarthBucks because it fully captures the mission of the blockchain (small casual
transactions for everybody on Planet Earth), and it is easy to remember, spell,
has no negative connotations, and I own the primary domain name
(earthbucks.com).

The software has not been finished, so I can't guarantee any particular launch
date, however my goal is to launch in July, unless I am unable to meet that
target. The primary library has been written in both Rust and TypeScript, but as
mentioned, it needs to be more thoroughly tested. The p2p software has not been
started, however that is only being blocked by not yet having the rigorously
tested main library. After that, the p2p network does not have that much code,
as it relies almost entirely on the main library for all of the data structures
and algorithms.

I can't allow an arbitrary number of people to use the product on launch day
because I can't test for that. So I will be limiting the number of people who can
use EarthBucks at launch to 100. In order to limit this, I will be creating a
pre-registration product. In order to pre-register, you will need to sign up at
earthbucks.com. Please be on the lookout for the announcement, to be made across
all social channels and the website, if you would like to pre-register. All
social links, blog posts, and announcements can be found at
[earthbucks.com](https://earthbucks.com).

## Conclusion

EarthBucks is a new blockchain with 42 million EBX, no pre-mine, GPUs, big
blocks, and script. It is conceptually similar to Bitcoin, but is a brand new
from-scratch implementation. There is no block size limit and the network is
intentionally governed with a TOS to ensure the network is used for its intended
purpose.
