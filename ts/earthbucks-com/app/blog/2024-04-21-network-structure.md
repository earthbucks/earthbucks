+++
title = "Network Structure, Domain Names, and Email Addresses"
author = "Ryan X. Charles"
date = "2024-04-21"
+++

EarthBucks has a radically different peer-to-peer network than Bitcoin. While
Bitcoin used a custom protocol on port 8333, which did not include a notion of
names or authenticated communications, EarthBucks is based on domain names (DNS)
and the web (HTTPS). EarthBucks mines and wallets have a domain name, and all
communications are authenticated and encrypted using HTTPS.

Let's consider three examples: a mine, a wallet, and a user.

The very first mine will be hosted at earthbucks.com. Users will be able to
visit the website, sign up, save their master private key, and start mining, all
from inside the browser. The user will have an address which can be their name,
say, name\@earthbucks.com, exactly like email addresses. Users can send money to
each other using these addresses, exactly like email.

Now consider a wallet. Wallets don't mine, but they otherwise work exactly the
same as mines. Users can visit the website, say, ebxpay.com, sign up, and create
a wallet. The wallet will have an address which can be their name, say,
name\@ebxpay.com. Users can send money to each other using these addresses,
exactly like email.

Finally, consider an independent user. Most users will not want to bother
running a web service to host either a mine or a wallet. They will simply sign
in as a user at an existing mine or wallet. Ordinary users will most likely not
have to pay any fees in order to use simple services like sending money, but
sophisticated services like high volume transactions and smart contracts may
cost fees. If the user doesn't want to pay these fees, or they don't trust any
of the existing mines or wallets, they can run their own mine or wallet.

Anybody can run a wallet. However, mines are limited in number to 2016. Why is
that? Because blocks occur every ten minutes, and there are 2016 blocks in a two
week target adjustment period. In order to poll mines about the validity of new
blocks and transactions, we must have a limit on the number of mines we poll. It
is extremely unlikely that any mine that doesn't produce a block in a target
adjustment period will be able to mine a block in the next target adjustment
period, because the target is likely to get harder every period. So there is no
reason to track mines that do not produce blocks in this period, placing a
practical upper limit of 2016 mines. Wallets, however, can be as numerous as the
number of users. This is not just true for EarthBucks, but for any proof-of-work
blockchain.

The network structure is thus expected to be as follows: A small number of
mines, as few as three and as numerous as 2016, will all directly connect to
each other. Wallets will connect to mines. Users will connect to wallets. Some
enthusiast users will run their own wallet, but by and large, mines and wallets
are expected to be professional businesses, not enthusiasts.
