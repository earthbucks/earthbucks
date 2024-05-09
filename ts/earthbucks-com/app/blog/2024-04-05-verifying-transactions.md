+++
title = "Verifying Transactions and Input/Output Equality"
author = "Ryan X. Charles"
date = "2024-04-05"
+++

I have just finished implementing the transaction verifier in both typescript
and rust and it has an important feature: it checks that the input values are
equal to the output values.

Checking that input value = output value is consistent with my earlier
declaration that change fees are eliminated. What this means in practice is that a
transaction is not valid if it includes a change fee.
