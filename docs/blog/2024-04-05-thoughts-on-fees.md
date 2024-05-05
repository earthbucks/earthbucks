# Thoughts on Fees

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