+++
title = "Client-Side Key Management"
author = "Ryan X. Charles"
date = "2024-05-01"
+++

It is important for security that users manage their own keys. If one or a
handful of servers have all the keys, that creates a giant security honeypot
that would draw attackers. But if users have their own keys, and validate their
own transactions, then the network is much more secure.

Consider that the more the keys are distributed, the higher cost for an attacker
to gather those keys. For the same amount of value stored in the tokens, the
cost can be raised arbitrarily by distributing the value over keys and over more
independent systems.

The first version of the wallet will require that the user generate a key
client-side that is never sent to a server. While this is not ideal for every
user, it is not too hard these days as most users have password managers. The
user can simply store their master key in a password manager.

Over the long-run, there are ways to make client-side key management easier. An
encrypted backup of each key can be sent to semi-trusted third-parties, who
can't see the key, but who can, together, reveal the key only to the original
owner. Imagine if one party has an encrypted backup, and another party has the
key to decrypt that backup, and both of those parties send both pieces to the
owner. This enables the owner to recover their key. I call this strategy "two
factor friend" - have your friends store material that can be used to recover
your key.

Two factor friend is not the only strategy for key management. Users can use
multisig outputs which require multiple independent keys. If the user has not
lost two of their devices, but only one, in a 2 of 3 multisig output, then they
can recover their funds.

The first version of the EarthBucks wallet will simply require the user recall
their primary key. This will be adequate for launch day and all early users.
However, we can and will improve the user experience of managing keys over time.

Note that, although I do not plan to launch a custodial service, custodial key
management is, of course, also possible, which may be better for some users,
even though it creates a honeypot for attackers.
