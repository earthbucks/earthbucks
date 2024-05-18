+++
title = "Why All UTXOs Expire After 90 Days"
author = "Ryan X. Charles"
date = "2024-05-18"
+++

All unspent outputs (UTXOs) on EarthBucks expire after 90 days to enable the
transaction format and verification code to be updated regularly without
supporting old software indefinitely.

Expiring outputs also encourages key rotation, which is a security best
practice, and pruning the blockchain, which improves scalability.

Additionally, output expiry also discourages paper wallets, HODLing, and "free
riding" (where a user never makes a payment to the network but maintains a UTXO
forever) and encourages users to either stay active, or pay someone to stay
active on their behalf, or to give away their tokens to someone who is active.
In other words, it encourages use, which is the primary goal of EarthBucks.

## Expiration Opcodes

I've created two new opcodes for EarthBucks that work in a very similar way to
counterparts on Bitcoin v2 transactions:

- CHECKLOCKABSVERIFY (the equivalent of Bitcoin's CHECKLOCKTIMEVERIFY)
- CHECKLOCKRELVERIFY (the equivalent of Bitcoin's CHECKSEQUENCEVERIFY)

These new opcodes check that the absolute lock time and relative lock time of a
transaction or input match the expected value, enabling conditions based on time
(or, rather, block number).

The values in EarthBucks transactions mirror those in Bitcoin:

- lock_abs: absolute lock number (the equivalent of Bitcoin's nLockTime)
- lock_rel: relative lock number (the equivalent of Bitcoin's nSequence)

I have renamed the variables in EarthBucks compared to Bitcoin, even though the
meaning is nearly equivalent to Bitcoin. In Bitcoin, nLockTime acts as an
absolute lock number, and the sequence number in an input acts as a relative
lock number. The new names reflect their actual use and purpose.

The transaction values mean the following:

- lock_abs: A value in each transaction that indicates the absolute block number
  where the transaction becomes valid, and before which it is invalid.
- lock_rel: A value in each input that indicates where the input is no longer
  invalidated (i.e., it becomes valid if all other conditions are in the script
  are valid) by a relative lock number, meaning lock_rel plus the block number
  of the previous output.

Note that EarthBucks includes the block number in the block header to make these
verifications simpler.

## Expiration Scripts

EarthBucks has a notion of "standard transactions" that works similar to
Bitcoin, but not exactly the same. On Bitcoin, non-standard transactions are not
relayed, but can be mined. On EarthBucks, only standard transactions are
broadcast and mined. This enables me to thoroughly test every script template
and associated transaction type thoroughly before launching it. Over time, I
expect this will lead to more enabled script templates than Bitcoin, because of
the increased confidence in the reliability of each template.

I plan to enable two standard transaction types at launch: 90 day expiry (PKHX
90D) and 6 hour expiry (PKHX 6H). 90 day expiry will be useful for ordinary
users, while 6 hour expiry will be useful for testing purposes only.

The PKHX 90D script, a.k.a. "90 day expiry", looks like this:

```script
IF
  DUP
  DOUBLEBLAKE3
  PUSHDATA1
  [32 byte public key hash]
  EQUALVERIFY
  CHECKSIG
ELSE
  PUSHDATA1
  [2 byte value representing the number 12960]
  CHECKLOCKRELVERIFY
  DROP
  1
ENDIF
```

A standard spending script, before expiry, looks like this:

```script
PUSHDATA1
[65 byte signature]
PUSHDATA1
[33 byte public key]
1
```

A standard spending script, after expiry, looks like this:

```script
0
```

All expired outputs are automatically spent by whichever mine mines the first
block where the output is expired. This means all users mining at that mine will
get a share in the expired tokens.

## Adding Recovery

It is common for users to lose their keys. It would be great if there were a way
for those users to recover their tokens. There is a way to do this by adding
more sophisticated scripts.

After launch, one of the first new script types I plan to support will be
"public key hash expiry with recovery", which will be very similar to the above
scripts, except that a second key will become active after 60 days. This will
enable users to subscribe to recovery services who will have the ability to
recover any tokens not rotated within a 60 day window (so that the total expiry
time is still 90 days), which will be taken as an indication that the user has
lost their key.

Using a recovery service will require non-cryptographic KYC methods, such as
email, phone, and government ID verification. It is assumed that a user who has
lost their keys still has some alternate means to prove their identity which
must be provided in advance.

Recovery most likely will not be supported at launch, but is an example of the
type of script template that can be standardized and added over time. Because I
am sure users will want this, I plan to add this shortly after launch, along
with a service to provide recovery.

## Why 90 Days?

I've thought deeply about what time schedule the default expiry should be. 90
days is ideal because it is long enough that monthly active users will not have
to think about it, which is a time scale consistent with active users on almost
any platform. But it is also short enough that non-active users will have to pay
someone to maintain their tokens, or give them away to someone who will actually
use them. It is also short enough that the network can be upgraded regularly
without having to wait an unsually long time, such as a year, between upgrades.
Quarterly upgrades are a realistic time frame for developers that does not hurt
users.

Also, [Let's Encrypt uses a 90 day expiry for SSL
certificates](https://letsencrypt.org/2015/11/09/why-90-days.html). Although
that scenario is different in many ways, it is close enough that using the same
value makes sense intuitively.

There is a 1 hour (6 block) expiry output type as well, which is only useful for
testing purposes, such as for mine and wallet developers. Ordinary users are not
expected to use the 1 hour expiry type.

## Advantages of Expiration

### Software Upgradeability

There are users of Bitcoin who have not spent their UTXOs since 2009. There is
no way to know whether these users will ever spend those UTXOs or not. This
means the software capable of spending those old UTXOs must be maintained
forever, while at the same time providing no form of revenue to the network
operators ("miners" or "nodes" or "developers") to support that software
maintenance. It is my humble opinion that this is not sustainable. It creates a
drag on all new development and stops Bitcoin from changing. Although some users
think lack of change is good for Bitcoin, in my opinion this makes it impossible
for Bitcoin to compete with superior alternatives.

UTXO expiry makes EarthBucks upgradeable. I am a fallible developer and I am
unlikely to create perfect software at launch. By expiring outputs, I know that
I will be able to change all aspects of the software over time. If I fail to
create optimal data structures and algorithms at launch, it is no worry, because
I know that as I discover new and better ways of doings things, I will be able
to update everything, even the structure of outputs.

### Software Scalability

Every mine must maintain all active UTXOs so that when new transactions and
blocks come in, they can be validated. If UTXOs never expire, this means the
total amount of data grows without end, even if the network is not actually
growing in usage.

By expiring all UTXOs, that means the active UTXO set stays the same size as the
number of active users, so that the scale of the network matches usage. By
charging users to use the network, this means revenue actually matches usage.

This is clearly a more sustainable model than Bitcoin, which enables HODLing
users to get a free ride on the network, never paying for the functionality of
securing their tokens.

### Encouraging Usage

Output expiry will be clearly explained to all users joining the network. As
such, EarthBucks will have a reputation as a pro-usage network. Although it is
not impossible to HODL (which simply means holding tokens and not using them),
HODLing will require more effort from the user, as they will either have to log
in regularly to rotate their keys, or maintain some software tool to do this on
their behalf, or pay a service to do this for them.

Paper wallets are not possible on EarthBucks. If a user sends funds to a UTXO on
a paper wallet, and then does not rotate those keys within 90 days, the tokens
will be mined and sent to active users.

Most users of cryptocurrency use custodial exchanges like Coinbase to hold their
tokens. Custodial services will use automated software to manage the user's
keys, which will perform the key rotation automatically. The same thing will
most likely be true for EarthBucks, meaning that most users will not have to
think about this at all, because they will simply use a custodial service that
solves the problem for them.

## What does this mean for me?

If you are a user of a self-custodial wallet, you will need to log in once per
month and press a button to rotate your keys. If you are a user of an exchange,
there is nothing you will have to worry about.

If you are a developer, you need to make sure all scripts you create are a
standard script type, otherwise your transactions will not be valid.

## Conclusion

EarthBucks is designed to be used. UTXO expiry is consistent with this
philosophy. Active users will have no problems maintaining their tokens, because
all they will have to do is press a button once per month or so to rotate their
keys. Inactive users can simply pay someone to do this for them, ensuring that
the network is paid for maintenance either way. Advantages include software
upgradeability, scalability, and incentivizing the right culture of usage and
security.
