+++
title = "CHECKSIG, CHECKMULTISIG, Building, Signing, and Verifying Transactions"
author = "Ryan X. Charles"
date = "2024-04-04"
+++

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
- Currently I support building and signing PubKeyHash transactions only. Because
  the primary use-case is for payments, and because even CHECKMULTISIG is both
  not necessary for payments and not widely used in practice, I will make sure
  the full stack of software works for PubKeyHash and will await until later to
  enable more complex transactions. The way this will work in practice is that
  there will be a list of standard transaction templates that grows with time.
  